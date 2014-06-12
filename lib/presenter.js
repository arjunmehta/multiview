var net = require('net');
var tty = require('tty');

var keypress = require('keypress');
var columnify = require('columnify');

var numTTYcolumns = process.stdout.columns;
var numTTYrows = process.stdout.rows;

var channel = "";

function initialize(program){
  channel = program.channel;
}

var server = net.createServer(function(stream) {
  stream.on('data', handleInput);
  stream.on('end', function() {
    server.close();
  });
});

server.listen('test.sock');








function handleInput(data){
  var splitIndex = message.indexOf("::");
  var processName = message.substr(0, splitIndex);
  var message = message.slice(2+splitIndex-message.length);
}


process.stdout.on('resize', function() {
  numTTYcolumns = process.stdout.columns;
  numTTYrows = process.stdout.rows;
  if(isPresenter === true){
    redraw();
  }
});



process.on('exit', function(code) {
  
});


module.exports = exports = initialize;