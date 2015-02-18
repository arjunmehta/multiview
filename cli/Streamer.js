var net = require('net');
var util = require('util');
var stream = require('stream');

var headerfooter = require('stream-headerfooter');

var PassThrough = stream.PassThrough || require('readable-stream').PassThrough;
util.inherits(Streamer, PassThrough);


function Streamer(name, channel) {

    PassThrough.call(this);

    var _this = this;

    var retryCount = 0,
        timeOut = 5000,
        reconnectInterval = 100,
        lineQueue = [],
        socket = new net.Socket(),
        socketPath = __dirname + '/' + channel + '.sock';

    this.connected = false;
    this.socket = socket;

    this.controller = new headerfooter.Out({
        header: {
            id: name
        }
    });

    this.controller.pipe(socket, {
        end: false
    });

    this.controller.on('error', function(err) {
        // console.log('Controller error', err);
    });

    this.lineQueue = lineQueue;

    this.on('data', function(data) {
        _this.writeToStream(data);
    });

    socket.on('connect', function() {
        retryCount = 0;
        _this.connected = true;

        for (var i = 0; i < lineQueue.length; i++) {
            _this.controller.write(lineQueue[i]);
        }
        lineQueue = [];

        if (_this.exiting !== false) {
            _this.controller.end();
            socket.end();
            socket.destroy();
            socket.unref();
            _this.emit('end', _this.exiting);
        }
    });

    socket.on('close', function(error) {
        if (error) {}
        _this.connected = false;
        tryConnect();
    });

    socket.on('end', function() {
        // console.log('Socket Ended');
    });

    socket.on('error', function(err) {
        // console.log('Socket Error', err);
    });

    tryConnect();

    function tryConnect() {

        setTimeout(function() {

            if (retryCount < timeOut) {
                socket.connect(socketPath);
                retryCount += reconnectInterval;
            } else {
                // _this.emit('error', new Error('Timeout'));
            }

        }, reconnectInterval);
    }
}

Streamer.prototype.exit = function(code) {

    this.controller.footer = {
        exitCode: code
    };

    this.exiting = code;

    if (this.connected === true) {
        this.emit('exit', code);
        this.controller.end();
    }
};

Streamer.prototype.writeToStream = function(data) {

    if (this.socket.writable === true) {
        if (data !== '') {
            this.controller.write(data);
        }
    } else {
        this.lineQueue.push(data);
    }
};


module.exports = exports = Streamer;
