var util = require('util');
var stream = require('stream');
var PassThrough = stream.PassThrough || require('readable-stream').PassThrough;

util.inherits(Streamer, PassThrough);

function MVStream(main, name) {
    
    var _this = this;
    PassThrough.call(this);

    this.main = main;
    this.receiver = main.receiver;
    this.id = name;
    this.output = this.receiver.newStream(this);
    this.exitCode = false;

    // this.on('end', function() {
    //     if (_this.exitCode !== false) {
    //         _this.output.header = _this.exitCode;
    //     }
    // });
}

MVStream.prototype.exit = function(exitCode) {
    this.exitCode = exitCode;
    this.main.emit('exit', this, exitCode);
    this.emit('exit', exitCode);
    this.output.header = this.output.header + ' (done)';    
    this.end('\nExited with code: ' + exitCode);
};