var util = require('util');

var Receiver = require('./lib/Receiver');
var Spawn = require('./lib/Spawn');
var Stream = require('./lib/Stream');

var EventEmitter = require("events").EventEmitter;
util.inherits(MultiView, EventEmitter);


function MultiView(opts) {

    if (!(this instanceof MultiView)) {
        return new MultiView(opts);
    }

    EventEmitter.call(this);

    this.opts = opts || {};

    this.receiver = null;
    this.streams = [];
}

MultiView.prototype.spawn = function(command, args, opts) {

    checkReceiver(this);

    if (!Array.isArray(args) && typeof args === 'object') {
        opts = args;
        args = [];
    } else {
        opts = opts || {};
    }

    var name = opts.name || command + (args ? ' ' + args.join(' ') : '');
    var stream = opts.stream || this.stream(name);

    return new Spawn(stream, command, args, name);
};

MultiView.prototype.stream = function(name, opts) {

    checkReceiver(this);
    opts = opts || {};

    var _this = this;
    var stream = new Stream(this, name);

    this.streams.push(stream);

    stream.on('exit', function(code) {
        _this.emit('exit', stream, code);
    });

    return stream;
};


function checkReceiver(mv) {
    if (mv.receiver === null) {
        mv.receiver = new Receiver(mv.opts);
    }
}

module.exports = exports = MultiView;
