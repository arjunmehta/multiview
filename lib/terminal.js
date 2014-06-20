var net = require('net');

var stripAnsi = require('strip-ansi');
var byline = require('byline');
var input = byline(process.stdin);

var stdInEnded = false;

var name,
    channel,
    channelTag,
    socketPath;

var connected = false,
    retryCount = 0,
    timeOut = 5000,
    reconnectInterval = 100;

var lineQueue = [];

var stream = new net.Socket();


// initialization method

function initialize(program){

  name = typeof program.stream === 'string' ? program.stream : "PID:"+process.pid;
  channel = program.channel;
  channelTag = "::" + channel + "::"; 
  socketPath = __dirname +"/"+ channel + '.sock';
  // console.log("socketPath", socketPath);
  tryConnect();
}


// socket stream
// the stream is where we are sending what is piped into this process

function tryConnect(){

  // console.log("RETRY COUNT", retryCount, timeOut);

  setTimeout(function(){

    if(retryCount < timeOut){
      stream.connect(socketPath);
      retryCount+=reconnectInterval;
    }
    else{
      process.exit(0);
    }

  }, reconnectInterval); 
}

stream.on("connect", function(){

  // console.log("Connected Stream:", name);

  retryCount = 0;

  connected = true;
  for (var i = 0; i < lineQueue.length; i++) {
    stream.write(lineQueue[i] + "\n");
  }
  lineQueue = [];

  if(stdInEnded === true){
    process.exit(0);
  }
});


stream.on("close", function(had_error){

  if(had_error){
    // console.log("HAD ERROR", had_error);
  }
  // console.log("Process" + process.pid + ":STREAM CLOSED");
  connected = false;
  tryConnect();
});


stream.on("end", function(){
  // console.log("Ended Stream: " + name);
  connected = false;
});


stream.on("error", function(e){
  // process.exit(0);
  // console.error("Error for Stream:", name, ":", e.code);
});


// byline input

input.setEncoding('utf8');

input.on('data', function(line) {

  line = stripAnsi(line);
  line = line.replace("\u001b[0G", "");
  line = line.replace("\u000a", "");
  
  if(connected === true){
    if(line !== ''){
      stream.write(name + channelTag + line);
    }    
  }
  else{
    lineQueue.push(name + channelTag + line);
  }  
});


// base process std in 

process.stdin.on('error', function(err) {
  console.error("STDIN Error", err);
});

process.stdin.on('end', function() {
  stream.write("displayStreamExit" + channelTag + name);
  stream.end();
  stdInEnded = true;
});


// std out

process.stdout.on('error', function(err) {
    console.error("STDOUT Error", err);
});


// process handlers

process.on('exit', function(code) {
  // console.log("exiting process", name);
  stream.destroy();
  stream.unref();
  stream.end();
});


module.exports = exports = initialize;
