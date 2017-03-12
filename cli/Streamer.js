var net = require('net');
var util = require('util');
var path = require('path');
var stream = require('stream');

var EventTransmitter = require('event-transmitter');
var PassThrough = stream.PassThrough || require('readable-stream').PassThrough;

util.inherits(Streamer, PassThrough);


function Streamer(name, channel, opts) {
  opts = opts || {};
  PassThrough.call(this);

  var _this = this;
  var retryCount = 0;
  var timeOut = 10000;
  var reconnectInterval = 1000;
  var lineQueue = [];
  var socket = new net.Socket();
  var socketPath = path.join(__dirname, '/' + channel + '.sock');
  var logConnectMessages = opts.logConnectMessages !== undefined ? opts.logConnectMessages : true;
  var first = true;

  this.connected = false;
  this.exiting = false;
  this.socket = socket;
  this.lineQueue = lineQueue;

  this.controller = new EventTransmitter();
  this.controller.transmit('header', { id: name });

  this.controller.on('error', function(err) {
    if (logConnectMessages === true) {
      console.error('Multiview Streaming Error for: [', name, ']', err);
    }
  });

  this.on('data', function(data) {
    if (first === true) {
      tryConnect(10);
      first = false;
    }
    _this.writeToStream(data);
  });

  _this.controller.on('drain', function() {
    if (_this.exiting !== false) {
      _this.controller.transmit('footer', {
        exitCode: _this.exiting
      });
    }
  });

  socket.on('connect', function() {
    if (logConnectMessages === true) {
      console.log('Multiview Stream [', name, '] connected to Display.');
    }

    retryCount = 0;
    _this.connected = true;
    _this.controller.pipe(socket);
    _this.emit('socketBegun');

    for (var i = 0; i < lineQueue.length; i++) {
      _this.controller.write(lineQueue[i]);
    }

    lineQueue = [];

    if (_this.exiting !== false) {
      _this.controller.transmit('footer', {
        exitCode: _this.exiting
      });
    }
  });

  socket.on('close', function() {
    _this.connected = false;
  });

  socket.on('end', function() {
    if (logConnectMessages === true) {
      console.log('Multiview Stream [', name, '] Ended');
    }
    _this.emit('socketEnded');
  });

  socket.on('error', function(err) {
    if (logConnectMessages === true) {
      console.error('Multiview Stream Socket Error for [', name, ']\nDo you have a Display instance open to receive this stream?', err);
    }
    tryConnect(reconnectInterval);
  });

  function tryConnect(reconnectDelay) {
    setTimeout(function() {
      if (retryCount < timeOut) {
        socket.connect(socketPath);
        retryCount += reconnectInterval;
      }
    }, reconnectDelay);
  }
}

Streamer.prototype.exit = function(code) {
  this.exiting = code;
};

Streamer.prototype.writeToStream = function(data) {
  if (data !== '') {
    if (this.connected === true) {
      this.controller.write(data, function() {});
    } else {
      this.lineQueue.push(data);
    }
  }
};


module.exports = Streamer;
