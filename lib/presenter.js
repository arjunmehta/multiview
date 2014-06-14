var net = require('net');
var fs = require('fs');

var keypress = require('keypress');
var columnify = require('columnify');
var width = require('./width');


var numTTYcolumns = process.stdout.columns;
var numTTYrows = process.stdout.rows;

var uiHeight = 2;
var displayHeight = numTTYrows - uiHeight;
var columnWidth = numTTYcolumns;
var columnSpacing = 2;
var columnSpace = "  ";
var emptyLine = new Array(numTTYcolumns + 1).join(" ");
var separatorLine = new Array(numTTYcolumns + 1).join("-");

var settings = {
  wrap: false,
  overflow: 7
};

var wrap = false;
var overflow = 7;

var displayStreamIndex = [];
var displayStreams = {};
var displayViews = [];

var channel,
    socketPath;

var routes = {};


if(process.stdin.isTTY){

  console.log("IS A TTY");

  keypress(process.stdin);
  process.stdin.resume();
  process.stdin.setRawMode(true);

  process.stdin.on('keypress', function (ch, key) {
    console.log('got "keypress"', key);
    if (key && key.ctrl && key.name == 'c') {
      process.stdin.pause();
      process.exit(0);
    }
  });
}


function initialize(program){

  channel = program.channel;
  socketPath = __dirname +"/"+ channel + '.sock';
  console.log("Server socketPath", socketPath);
  server.listen(socketPath);

  redrawAll();

}


var server = net.createServer(function(stream) {

  stream.setEncoding('utf8');

  stream.on('data', handleSocketMessage);

  stream.on('end', function() {
    server.close();
  });
});


server.on('error', function(e){
  if (e.code == 'EADDRINUSE') {
    var clientSocket = new net.Socket();
    clientSocket.on('error', function(e) { // handle error trying to talk to server
      if (e.code == 'ECONNREFUSED') {  // No other server listening
        fs.unlinkSync(socketPath);
        server.listen(socketPath, function() { //'listening' listener
          console.log('server recovered');
        });
      }
    });
    clientSocket.connect({path: socketPath}, function() { 
      console.log('Server running, giving up...');
      process.exit();
    });
  }
});


function handleSocketMessage(message){
  // console.log(message);
  var splitIndex = message.indexOf("::");
  var route = message.substr(0, splitIndex);
  message = message.slice(2+splitIndex-message.length);

  if(routes[route] !== undefined){
    routes[route](message);
  }
  else{
    routes.newDisplayStream(route);
    routes[route](message);
  }
}


function createDisplayStreamListener(displayStreamID){
  return function(message){
    displayStreams[displayStreamID].updateData(message);
  };
}

routes.newDisplayStream = function(displayStreamID){

  if(!displayStreams[displayStreamID]){

    process.stdout.cursorTo(0, -1);
    process.stdout.clearLine();
    process.stdout.write("New DisplayStream: " + displayStreamID);

    displayStreams[displayStreamID] = new DisplayStream(displayStreamID);
    displayStreamIndex.push(displayStreamID);

    columnWidth = Math.floor(numTTYcolumns/displayStreamIndex.length) - columnSpacing;

    routes[displayStreamID] = createDisplayStreamListener(displayStreamID);

    var displayView = new DisplayView(displayStreams[displayStreamID], displayStreamID, displayViews.length);
    displayViews.push(displayView);

    displayStreams[displayStreamID].view = displayView;

    redrawAll();

  }
};

routes.displayStreamExit = function(displayStreamID){
  displayStreamExit(displayStreamID);
};


function redrawAll(){

  process.stdout.write('\033[2J\033[0f');

  // renderHeaders();
  renderSeparator();

  for (var i = 0; i < displayViews.length; i++) {
    displayViews[i].rerender();
  }
}

function renderHeaders(){
  for (var i = 0; i < displayViews.length; i++) {
    displayViews[i].renderHeader();
  }
}

function renderSeparator(){
  process.stdout.cursorTo(0, 1);
  process.stdout.write(separatorLine);
}


function DisplayStream(name){
  this.id = name;
  this.active = true;
  this.data = [];
  this.newestChunk = [];
  this.displaying = true;
  this.view = null;
}

DisplayStream.prototype.updateData = function(data){

  var truncatedData = data.replace(/[^\S\n]/gmi, ' ');
  var dataSplit = truncatedData.split("\n");

  if(dataSplit[dataSplit.length-1] === '') dataSplit.pop();

  if(this.displaying === true && this.view !== null){

    for (var i = 0; i < dataSplit.length; i++) {
      this.view.printLine(dataSplit[i]);
      this.data.push(dataSplit[i]);
    }

  }
  else{
    this.data = this.data.concat(dataSplit);
  }
};


function DisplayView(displayStream, displayStreamID, position){
  this.displayStream = displayStream;
  this.id = displayStreamID;
  this.position = position;
  this.y = 0;
  this.currentLines = []; // used when we need to rerender the column for whatever reason.
}


DisplayView.prototype.renderHeader = function(){

  process.stdout.cursorTo(this.position * (columnWidth + columnSpacing), 0);
  process.stdout.write(this.id.substring(0, columnWidth) + columnSpace);

};

DisplayView.prototype.rerender = function(){
  this.y = 0;
  for (var i = 0; i < this.currentLines.length; i++) {
    this.printLine(this.currentLines[i], true);
  }

  this.renderHeader();

};


DisplayView.prototype.checkOverflow = function(){
  if(this.y+1 > displayHeight){
    this.clearColumn();
  }
};


DisplayView.prototype.printLine = function(line, redrawing){
  
  if(redrawing === undefined){
    this.checkOverflow();
    this.currentLines[this.y] = line;
  }

  process.stdout.cursorTo(this.position * (columnWidth + columnSpacing), this.y+uiHeight);
  process.stdout.write(line.substring(0, columnWidth) + columnSpace);
  
  this.y++;
};


DisplayView.prototype.clearColumn = function(){

  var startIndex = this.displayStream.data.length-1-overflow;
  var output = "";
  var xpos = this.position * (columnWidth + columnSpacing);

  this.y = 0;  

  for (var i = 0; i < displayHeight; i++) {

    process.stdout.cursorTo(xpos, this.y+uiHeight);

    if(i < overflow){
      process.stdout.write(this.displayStream.data[startIndex+i+1].substring(0, columnWidth) + columnSpace);
      this.currentLines[this.y] = this.displayStream.data[startIndex+i];
    }
    else{
      process.stdout.write(emptyLine.substring(0, columnWidth) + columnSpace);
      this.currentLines[this.y] = emptyLine;
    }
    this.y++;
  }

  this.y = overflow;
};


// function renderDataNoWrap(data){

//   var displayHeight = numTTYrows - 3;
//   var numberOfLines = 0;
//   var lineWidth = 0;

//   var renderedText = "";

//   for (var i = data.length-1; i > -1; i--) {
//     numberOfLines ++;
//     renderedText = data[i].substring(0, columnWidth) + "\n" + renderedText;

//     if(numberOfLines >= displayHeight){
//       break;
//     }
//   }

//   // console.log("RENDERED TEXT", renderedText);

//   return renderedText;
// }



// function redrawColumnForStream(displayStream){

//   var colPosition = displayStreamIndex.indexOf(displayStream.id);
//   var xpos = (colPosition * columnWidth) + ((colPosition !== 0) ? 2*colPosition : 0);

//   var data = displayStream.data;
//   var displayHeight = numTTYrows - 3;
//   var numberOfLines = 0;
//   var output = "";

//   var numberOfOverflow = 7;

//   if(data.length > displayHeight){

//     for (var i = data.length-1; i > -1; i--) {
      
//       output = data[i].substring(0, columnWidth);
//       process.stdout.cursorTo(xpos, displayHeight-numberOfLines);
//       process.stdout.write(output);

//       numberOfLines++;
//       if(numberOfLines >= displayHeight){
//         break;
//       }
//     }

//     // process.stdout.cursorTo(xpos, 0);
//   }
//   else{
//     output = data[data.length-1].substring(0, columnWidth);
//     process.stdout.cursorTo(xpos, data.length);
//     process.stdout.write(output);
//   }
// }


// function printNewLines(displayStream, newLines){  

// }


// function printLines(displayStream, newlines){

//   for (var i = 0; i < newlines.length; i++) {

//     if(displayStream.y + 1 < displayHeight){
//       printLine(xpos, newlines[i]);
//     }
//     else{
//       clearColumn(displayStream);
//       printLine(xpos, newlines[i]);
//     }
    
//   }


//   /*

//     page = Math.floor(data.length / displayHeight);
//     start = page * displayHeight;

//     printline

//     if(y > displayHeight){
//       clearColumn(displayStream);
//       printLine(line);
//     }



//     clearColumn(displayStream){

//       displayStream.y = numberOfOverflow;
//     }


//     if number of lines to print + currentline is more than max lines


//   */



// }

// function printLine(line){  
//   process.stdout.write(line.substring(0, columnWidth));
// }

// function clearColumnLine(){
//   return emptyLine.substring(0, columnWidth);
// }


// presentation

process.stdout.on('resize', function() {
  numTTYcolumns = process.stdout.columns;
  numTTYrows = process.stdout.rows;

  columnWidth = Math.floor(numTTYcolumns/displayStreamIndex.length) - columnSpacing;

  emptyLine = new Array(numTTYcolumns + 1).join(" ");
  separatorLine = new Array(numTTYcolumns + 1).join("-");

  redrawAll();
});

process.stdout.on('error', function(err) {
    console.error(err);
});

process.stdin.on('error', function(err) {
    console.error(err);
});

process.on('exit', function(code) {
  process.stdout.write('\033[2J\033[0f');
  process.stdout.cursorTo(0, -1);
  process.stdout.clearLine();

  console.log("exiting presenter", server.address());
  try{
    server.close();
  }
  catch(e){
    console.log("cannot close server, may be already closed");
  }
  
});


module.exports = exports = initialize;