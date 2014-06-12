var net = require('net');
var fs = require('fs');
var tty = require('tty');

var keypress = require('keypress');
var columnify = require('columnify');
var width = require('./width');


var numTTYcolumns = process.stdout.columns;
var numTTYrows = process.stdout.rows;
var numcols = 1;
var columnWidth = numTTYcolumns;
var wrap = false;


var displayingColumns = {};
var terminalIndex = [];

var channel,
    socketPath;

var routes = {};
var terminals = {};


function initialize(program){
  channel = program.channel;
  socketPath = __dirname +"/"+ channel + '.sock';
  server.listen(socketPath);
}


var server = net.createServer(function(stream) {

  stream.setEncoding('utf8');

  stream.on('data', handleSocketMessage);
  stream.on('end', function() {
    server.close();
  });
});


server.on('error', function (e) {
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
  // process.stdout.write(message);  
  var splitIndex = message.indexOf("::");
  var route = message.substr(0, splitIndex);
  message = message.slice(2+splitIndex-message.length);

  if(routes[route] !== undefined){
    routes[route](message);
  }
  else{
    routes.newTerminal(route);
    routes[route](message);
  }
}


function createTerminalListener(terminalID){
  return function(message){
    terminals[terminalID].updateData(message);
  };
}

routes.newTerminal = function(terminalID){
  if(!terminals[terminalID]){

    console.log("NEW TERMINAL", terminalID);

    terminals[terminalID] = new Terminal(terminalID);
    terminalIndex.push(terminalID);

    columnWidth = Math.floor(numTTYcolumns/terminalIndex.length)-5;

    routes[terminalID] = createTerminalListener(terminalID);
  }
};

routes.terminalExit = function(terminalID){
  terminalExit(terminalID);
};



function Terminal(name){
  this.id = name;
  this.active = true;
  this.data = [];
  this.displaying = true;
}

Terminal.prototype.updateData = function(data){

  var truncatedData = data.replace(/[^\S\n]/gmi, ' ');
  var dataSplit = truncatedData.split("\n");  
  this.data = this.data.concat(dataSplit);

  // console.log("Truncated Data", this.data);

  // process.stdout.write(data);

  if(this.displaying === true){
    this.displayingData = wrap ? renderDataWrap(this.data) : renderDataNoWrap(this.data);
    redraw(this.id);
  }
};



// function renderDataWrap(data){

//   var maxLines = numTTYrows - 30;
//   var numberOfLines = 0;
//   var lineWidth = 0;

//   var renderedText = "";

//   for (var i = data.length -1; i > -1; i--) {
//     numberOfLines += Math.ceil(width(data[i])/columnWidth);
//     renderedText = data[i] + "\n" + renderedText;

//     if(numberOfLines >= maxLines){
//       break;
//     }
//   }

//   return renderedText;
// }



function renderDataNoWrap(data){

  var maxLines = numTTYrows - 3;
  var numberOfLines = 0;
  var lineWidth = 0;

  var renderedText = "";

  for (var i = data.length-1; i > -1; i--) {
    numberOfLines ++;
    renderedText = data[i].substring(0, columnWidth) + "\n" + renderedText;

    if(numberOfLines >= maxLines){
      break;
    }
  }

  // console.log("Number of Lines", numberOfLines, maxLines);

  return renderedText;
}



// presentation

process.stdout.on('resize', function() {
  numTTYcolumns = process.stdout.columns;
  numTTYrows = process.stdout.rows;
  if(isPresenter === true){
    redraw();
  }
});






function redraw(){

  var object = {};
  
  var terminalColumns = [];

  for (var i = 0; i < terminalIndex.length; i++) {
    object[terminalIndex[i]] = terminals[terminalIndex[i]].displayingData;
  }

  terminalColumns.push(object);

  var columnifyOpts = {
    maxWidth: columnWidth+10,
    preserveNewLines: true
  };

  // console.log("terminalColumns Width", columnWidth, numTTYcolumns, numTTYrows);

  process.stdout.cursorTo(0, 0);
  process.stdout.write(columnify(terminalColumns, columnifyOpts));

}


process.on('exit', function(code) {
  console.log("exiting presenter", server.address());
  server.close();
});









module.exports = exports = initialize;