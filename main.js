var Receiver = require('./lib/Receiver');
var Spawn = require('./lib/Spawn');
var Stream = require('./lib/Stream');

function MultiView(opts) {

    this.receiver = null;
    this.streams = {};
}

MultiView.prototype.spawn = function(command, args, opts) {

    checkReceiver(this);

    if (!Array.isArray(args) && typeof args === 'object') {
        opts = args;
        args = [];
    } else {
        opts = opts || {};
    }     

    return new Spawn(this, command, args, opts);
};

MultiView.prototype.stream = function(name, opts) {

    checkReceiver(this);
    opts = opts || {};

    this.streams[name] = new Stream(this, name);
    return this.streams[name];
};


function checkReceiver(mv) {
    if (mv.receiver === null) {
        mv.receiver = new Receiver(null, opts);
    }
}

module.exports = exports = new MultiView();
