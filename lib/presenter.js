var net = require('net');
var fs = require('fs');

var keypress = require('keypress');

var numTTYcolumns = process.stdout.columns;
var numTTYrows = process.stdout.rows;

var uiHeight = 2;
var displayHeight = numTTYrows - uiHeight;
var columnWidth = numTTYcolumns;
var columnSpacing = 2;
var columnSpace = "  ";
var emptyLine = new Array(numTTYcolumns + 1).join(" ");
var separatorLine = new Array(numTTYcolumns + 1).join("-");

var flow = false;
var overflow = 7;

var displayStreamIndex = [];
var displayStreams = {};
var displayViews = [];

var channel,
    channelTag,
    socketPath;

var routes = {};


function initialize(program){

  channel = program.channel;
  channelTag = "::" + channel + "::";  
  socketPath = __dirname +"/"+ channel + '.sock';
  console.log("Server socketPath", socketPath);

  process.stdout.write("\u001b[?25l");

  if(program.flow){
    flow = true;
  }

  server.listen(socketPath);
  redrawAll();
}


var server = net.createServer(function(stream) {

  stream.setEncoding('utf8');

  stream.on('data', handleSocketMessage);

  stream.on('end', function() {
    // server.close();
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

  var splitIndex = message.indexOf(channelTag);
  var route = message.substr(0, splitIndex);
  var splitMessage = message.split(route + channelTag);

  if(routes[route] === undefined){
    routes.newDisplayStream(route);
  }

  for (var i = 0; i < splitMessage.length; i++) {
    routes[route](splitMessage[i]);
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
  // displayStreamExit(displayStreamID);
};


function redrawAll(){

  process.stdout.write('\033[2J\033[0f');
  renderSeparator();

  for (var i = 0; i < displayViews.length; i++) {
    displayViews[i].redraw();
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


// Display Stream

function DisplayStream(name){
  this.id = name;
  this.active = true;
  this.data = [];
  this.newestChunk = [];
  this.displaying = true;
  this.view = null;
}

DisplayStream.prototype.updateData = function(data){

  var dataSplit = data.split("\n");
  var i = 0;

  // console.log(dataSplit);

  if(dataSplit[dataSplit.length-1] === '') dataSplit.pop();

  if(this.displaying === true && this.view !== null){

    if(flow === true){

      for (i = 0; i < dataSplit.length; i++) {
        this.data.push(dataSplit[i]);
        this.view.redrawFlow();
      }
    }
    else{

      for (i = 0; i < dataSplit.length; i++) {
        this.view.printLine(dataSplit[i]);
        this.data.push(dataSplit[i]);
      }
    }

  }
  else{
    this.data = this.data.concat(dataSplit);
  }
};


// Display View

function DisplayView(displayStream, displayStreamID, position){
  this.displayStream = displayStream;
  this.id = displayStreamID;
  this.position = position;
  this.y = 0;
  this.currentLines = []; // used when we need to redraw the column for whatever reason.
}

DisplayView.prototype.renderHeader = function(){

  process.stdout.cursorTo(this.position * (columnWidth + columnSpacing), 0);
  process.stdout.write(this.id.substring(0, columnWidth) + columnSpace);

};

DisplayView.prototype.redraw = function(){
  if(flow === true && this.displayStream.data.length > 0){
    this.redrawFlow();
  }
  else{
    this.redrawEfficient();
  }

  this.renderHeader();
};


DisplayView.prototype.redrawEfficient = function(){
  this.y = 0;
  for (var i = 0; i < this.currentLines.length; i++) {
    this.printLine(this.currentLines[i], true);
  }
};


DisplayView.prototype.redrawFlow = function(){

  var data = this.displayStream.data;

  if(data.length > displayHeight){

    this.y = 0;

    for (var i = data.length-1-displayHeight; i < data.length; i++) {
      this.printLine(data[i], true);
    }
  }
  else{
    this.y = data.length-1;
    this.printLine(data[data.length-1], true);
  }

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



// presentation/std out

process.stdout.on('resize', function() {
  numTTYcolumns = process.stdout.columns;
  numTTYrows = process.stdout.rows;

  columnWidth = Math.floor(numTTYcolumns/displayStreamIndex.length) - columnSpacing;

  emptyLine = new Array(numTTYcolumns + 1).join(" ");
  separatorLine = new Array(numTTYcolumns + 1).join("-");

  redrawAll();
});

process.stdout.on('error', function(err) {
    console.error("STDOUT Error", err);
});


// std in (keyboard)

if(process.stdin.isTTY){

  keypress(process.stdin);  
  process.stdin.setRawMode(true);

  process.stdin.on('keypress', function (ch, key) {
    // console.log('got "keypress"', key);
    if (key && ((key.ctrl && key.name == 'c') || key.name == 'q') ) {
      process.stdin.pause();
      process.exit(0);
    }
  });
}

process.stdin.on('error', function(err) {
    console.error("STDIN Error",err);
    process.exit(0);
});



// main process

process.on('exit', function(code) {

  process.stdout.cursorTo(0, numTTYrows-2- displayViews.length);
  console.log("exiting presenter", server.address());
  try{
    server.close();
  }
  catch(e){
    console.log("cannot close server, may be already closed");
  }  


  process.stdout.write("\u001b[?25h");

});

// var tagKeys = {
//   '\n': '\\n',
//   '\r': '\\r',
//   '\t': '\\t'
// };

// function tagSpecialCharsDynamic(str) {
//   var output = "", ch, replacement;
//   for (var i = 0; i < str.length; i++) {
//     ch = str.charAt(i);
//     if (ch < ' ' || ch > '~') {
//       replacement = tagKeys[ch];
//       if (replacement !== undefined) {
//         ch = replacement;
//       } else {
//         replacement = '\\u'+("000" + ch.charCodeAt(0).toString(16)).slice(-4);
//         tagKeys[ch] = replacement;
//         ch = replacement;
//       }
//     }
//     output += ch;
//   }
//   return output;
// }


module.exports = exports = initialize;