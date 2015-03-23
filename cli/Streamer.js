var net = require('net');
var util = require('util');
var stream = require('stream');

var headerfooter = require('stream-headerfooter');

var PassThrough = stream.PassThrough || require('readable-stream').PassThrough;
util.inherits(Streamer, PassThrough);


function Streamer(name, channel, opts) {

    opts = opts || {};


    PassThrough.call(this);

    var _this = this;

    var retryCount = 0,
        timeOut = 10000,
        reconnectInterval = 1000,
        lineQueue = [],
        socket = new net.Socket(),
        socketPath = __dirname + '/' + channel + '.sock',
        logConnectMessages = opts.logConnectMessages !== undefined ? opts.logConnectMessages : true;

    this.connected = false;
    this.exiting = false;
    this.socket = socket;
    this.lineQueue = lineQueue;

    this.controller = new headerfooter.Out({
        header: {
            id: name
        }
    });

    this.controller.on('error', function(err) {
        if (logConnectMessages === true) {
            console.error('Multiview Streaming Error for: [', name, ']');
        }
    });

    this.on('data', function(data) {
        _this.writeToStream(data);
    });

    socket.on('connect', function() {
        if (logConnectMessages === true) {
            console.log('Multiview Stream [', name, '] connected to Display.');
        }

        _this.emit('socketBegun');

        _this.controller.pipe(socket);

        retryCount = 0;
        _this.connected = true;

        for (var i = 0; i < lineQueue.length; i++) {
            // console.log("LINEQUEUE Process", process.pid, lineQueue[i].toString(), _this.socket.writable);
            _this.controller.write(lineQueue[i]);
        }
        lineQueue = [];

        if (_this.exiting !== false) {
            _this.controller.end();
        }
    });

    socket.on('close', function(error) {
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
            console.error('Multiview Stream Socket Error for [', name, ']\nDo you have a Display instance open to receive this stream?');
        }
        tryConnect();
    });

    tryConnect();

    function tryConnect() {

        setTimeout(function() {

            if (retryCount < timeOut) {
                socket.connect(socketPath);
                retryCount += reconnectInterval;
            } else {}

        }, reconnectInterval);
    }
}

Streamer.prototype.exit = function(code) {

    this.controller.footer = {
        exitCode: code
    };

    this.exiting = code;

    if (this.connected === true) {
        this.controller.end();
    }
};

Streamer.prototype.writeToStream = function(data) {

    if (data !== '') {
        if (this.connected === true) {
            this.controller.write(data);
        } else {
            this.lineQueue.push(data);
        }
    }
};


module.exports = exports = Streamer;
