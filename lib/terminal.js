var net = require('net');
var tty = require('tty');

var name, 
    channel, 
    socketPath;

var stream;

function initialize(program){
  name = program.terminal === true ? "PID:"+process.pid : program.terminal;
  channel = program.channel;
  socketPath = __dirname +"/"+ channel + '.sock';

  stream = net.connect(socketPath);
}

console.log("Terminal Started");

process.stdin.setEncoding('utf8');
process.stdin.resume();

process.stdin.on('data', function(data) {
    // process.stdout.write('data: ' + data);
    // console.log(data);
    stream.write(name + "::" + data);
});

process.stdin.on('end', function() {
  stream.end();
});

process.on('exit', function(code) {
  console.log("exiting process", name);
  stream.end();
});



module.exports = exports = initialize;
