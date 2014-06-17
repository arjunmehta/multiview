var net = require('net');

var JSONStream = require('JSONStream');
var readline = require('readline');
var stripAnsi = require('strip-ansi');

var rl = readline.createInterface({
  input: process.stdin,
  terminal: false
});

var name,
    channel,
    channelTag,
    socketPath;

var connected = false;
var queue = [];

var stream = new net.Socket();

function initialize(program){
  name = program.stream === true ? "PID:"+process.pid : program.stream;
  channel = program.channel;
  channelTag = "::" + channel + "::"; 
  socketPath = __dirname +"/"+ channel + '.sock';

  console.log("socketPath", socketPath);
  tryConnect();
}

function tryConnect(){
  setTimeout(function(){
    stream.connect(socketPath);
  }, 100); 
}

stream.on("error", function(e){
  console.log("Stream Error", e.code);
  tryConnect();
});

stream.on("connect", function(){

  console.log("STREAM CONNECTED");

  connected = true;
  for (var i = 0; i < queue.length; i++) {
    stream.write(queue[i] + "\n");
  }
  queue = [];
});

stream.on("close", function(had_error){
  console.log("Process" + process.pid + ":STREAM CLOSED");
  connected = false;
  tryConnect();
  // process.exit(0);
});

stream.on("end", function(){
  console.log("STREAM ENDED");
  connected = false;
});


function replaceAll(str, replaced, replacing) {
    return str.replace(
        new RegExp(replaced.replace(/[.^$*+?()[{\|]/g, '\\$&'), 'g'),
        replacing
    );
}



rl.on("line", function(line){

  line = stripAnsi(line);
  line = line.replace("\u001b[0G", "");
  line = line.replace("\u000a", "");
  
  if(connected === true){

  // var ramndom = Math.random().toString(32);
  // stream.write("<" + ramndom  + ">"+ line + "</"+ ramndom + ">\n");

    if(line !== ''){
      stream.write(name + channelTag + line);
    }
    
  }
  else{
    // console.log(data);
    queue.push(name + channelTag + line);
  }  
});

// process.stdin.setEncoding('utf8');
// process.stdin.resume();

// process.stdin.on('data', function(data) {

//   data = stripAnsi(data);
//   // data = data.replace(/[^\S]/gmi, ' ');
//   data = data.replace(/\r\n|\r|\n/g, '');

//   if(connected === true){
//     // data = data.replace(/\u001b/gmi, ' ');
//     stream.write(name + "::\n" + data);
//     // var ramndom = Math.random().toString(32);
//     // stream.write("<" + ramndom  + ">"+ data + "</"+ ramndom + ">\n");

//   }
//   else{
//     // console.log(data);
//     queue.push(data);
//   }  
// });

// process.stdin.on('error', function(err) {
//   console.error(err);
// });


// process.stdin.on('end', function() {
//   stream.end();
//   process.exit(0);
// });



process.on('exit', function(code) {
  // console.log("exiting process", name);
  stream.destroy();
  stream.unref();
  stream.end();
});

process.stdout.on('error', function(err) {
    console.error(err);
});



module.exports = exports = initialize;
