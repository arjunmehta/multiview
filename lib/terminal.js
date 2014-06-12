var net = require('net');
var tty = require('tty');

var name;

function initialize(program){
  name = program.terminal === true ? "PID:"+process.pid : program.terminal;
}


process.stdin.setEncoding('utf8');

var stream = net.connect('test.sock');

process.stdin.on('readable', function() {
  var chunk = process.stdin.read();
  if (chunk !== null) {
    // process.stdout.write('data: ' + chunk);
    stream.write(chunk);
  }
});

process.stdin.on('end', function() {
  stream.end();
});

process.on('exit', function(code) {
  
});


module.exports = exports = initialize;
