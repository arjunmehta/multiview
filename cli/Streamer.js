var net = require('net');
var split = require('split');

var util = require('util');
var stream = require('stream');
var PassThrough = stream.PassThrough || require('readable-stream').PassThrough;

util.inherits(Streamer, PassThrough);


function Streamer(opts) {

    opts = opts || {};

    var _this = this;

    PassThrough.call(this);

    var connected = false,
        retryCount = 0,
        timeOut = 5000,
        reconnectInterval = 100,
        lineQueue = [],
        stream = new net.Socket({writableObjectMode: true});

    var name = typeof opts.stream === 'string' ? opts.stream : "PID:" + process.pid;
    name = opts.name;
    var channel = opts.channel || 'multiview_main';
    var channelTag = "::" + channel + "::";
    var socketPath = __dirname + "/" + channel + '.sock';

    this.stream = stream;
    this.lineQueue = lineQueue;
    this.channelTag = channelTag;
    this.name = name;

    this.connected = false;
    this.first = true;
    this.exiting = false;

    this.on('data', function(data) {
        this.writeToStream(name + channelTag + data);
    });

    stream.on("connect", function() {

        _this.emit('connect');

        // console.log("stream", stream);

        if (_this.first === true) {
            stream.write(name + channelTag + '\n');
        }

        retryCount = 0;
        _this.connected = true;

        for (var i = 0; i < lineQueue.length; i++) {
            stream.write(lineQueue[i]);
        }
        lineQueue = [];

        if (_this.exiting !== false) {
            _this.exit(_this.exiting);
            _this.emit('exiting', _this.exiting);
        }
    });

    stream.on("close", function(error) {
        _this.connected = false;
        // stream.destroy();
        _this.emit('close', error);
    });

    stream.on("end", function() {
        _this.connected = false;
        _this.emit('end');
        // console.log("CLOSED", stream);
        // console.log("ENDING: ", name);
    });

    stream.on("error", function(error) {
        // tryConnect();
        _this.emit('error', error);
    });

    tryConnect();

    function tryConnect() {

        setTimeout(function() {

            if (retryCount < timeOut) {
                stream.connect(socketPath);
                retryCount += reconnectInterval;
            } else {
                _this.emit('error', new Error("Timeout"));
            }

        }, reconnectInterval);
    }

    // process.on('exit', function(code) {
    //     stream.destroy();
    //     stream.unref();
    //     stream.end();
    // });
}

Streamer.prototype.exit = function(code) {
    this.exiting = code;
    if (this.connected === true) {
        this.stream.end("streamExit" + this.channelTag + this.name + this.channelTag + this.exiting + "\n");
    }
};

Streamer.prototype.writeToStream = function(data) {
    if (this.connected === true) {
        if (data !== '') {
            this.stream.write({name: this.name, data: data + '\n'});
        }
    } else {
        this.lineQueue.push({name: this.name, data: data + '\n'});
    }
};


module.exports = exports = Streamer;
