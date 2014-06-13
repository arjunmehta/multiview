var net = require('net');
var fs = require('fs');

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

  // process.stdout.write('\033[2J\033[0f');

  channel = program.channel;
  socketPath = __dirname +"/"+ channel + '.sock';
  console.log("Server socketPath", socketPath);
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

    process.stdout.cursorTo(0, -1);
    process.stdout.clearLine();
    process.stdout.write("New Terminal: " + terminalID);

    terminals[terminalID] = new Terminal(terminalID);
    terminalIndex.push(terminalID);

    columnWidth = Math.floor(numTTYcolumns/terminalIndex.length) - 2;

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

  if(this.displaying === true){
    this.displayingData = wrap ? renderDataWrap(this.data) : renderDataNoWrap(this.data);
    redrawColumn(this);
  }
};



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

  return renderedText;
}



function redrawColumn(terminal){

  var colPosition = terminalIndex.indexOf(terminal.id);
  var xpos = (colPosition * columnWidth) + ((colPosition !== 0) ? 2*colPosition : 0);

  var data = terminal.data;
  var maxLines = numTTYrows - 3;
  var numberOfLines = 0;
  var output = "";

  if(data.length > maxLines){

    for (var i = data.length-1; i > -1; i--) {
      
      output = data[i].substring(0, columnWidth);
      process.stdout.cursorTo(xpos, maxLines-numberOfLines);
      process.stdout.write(output);

      numberOfLines++;
      if(numberOfLines >= maxLines){
        break;
      }
    }

    process.stdout.cursorTo(xpos, 0);
  }
  else{
    output = data[data.length-1].substring(0, columnWidth);
    process.stdout.cursorTo(xpos, data.length);
    process.stdout.write(output);
  }
}

// presentation

process.stdout.on('resize', function() {
  numTTYcolumns = process.stdout.columns;
  numTTYrows = process.stdout.rows;
  if(isPresenter === true){
    redraw();
  }
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