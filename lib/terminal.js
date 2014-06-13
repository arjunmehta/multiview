var net = require('net');

var name,
    channel,
    socketPath;

var connected = false;
var queue = [];

var stream = new net.Socket();


function initialize(program){
  name = program.terminal === true ? "PID:"+process.pid : program.terminal;
  channel = program.channel;
  socketPath = __dirname +"/"+ channel + '.sock';
  // console.log("socketPath", socketPath);

  setTimeout(function(){
    stream.connect(socketPath);
  }, 100);
}


stream.on("error", function(e){

  console.log("Stream Error", e.code);

  // setTimeout(function(){
  //   stream.connect(socketPath);
  // }, 100);
});

stream.on("connect", function(){

  console.log("STREAM CONNECTED");

  connected = true;
  for (var i = 0; i < queue.length; i++) {
    stream.write(name + "::" + queue[i]);
  }
  queue = [];
});

stream.on("close", function(had_error){
  console.log("STREAM CLOSED");
  connected = false;
  process.exit(0);
});

stream.on("end", function(){
  connected = false;
});


// console.log("Terminal Started");

process.stdin.setEncoding('utf8');
process.stdin.resume();

process.stdin.on('data', function(data) {
  if(connected === true){
    stream.write(name + "::" + data);
  }
  else{
    queue.push(data);
  }  
});

process.stdin.on('error', function(err) {
    console.error(err);
});


process.stdin.on('end', function() {
  stream.end();
  process.exit(0);
});

process.on('exit', function(code) {
  console.log("exiting process", name);
  stream.destroy();
  stream.unref();
  stream.end();
});

process.stdout.on('error', function(err) {
    console.error(err);
});



module.exports = exports = initialize;
