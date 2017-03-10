var util = require('util');
var stream = require('stream');

var PassThrough = stream.PassThrough || require('readable-stream').PassThrough;

util.inherits(Stream, PassThrough);


function Stream(main, name, silentMode) {
  PassThrough.call(this);

  this.main = main;
  this.receiver = main.receiver;
  this.id = name;
  this.exitCode = false;
  this.log = '';

  if (!silentMode) {
    this.output = this.receiver.newStream(this);
    this.pipe(this.output);

    this.on('data', function(data) {
      this.log += data;
    });
  }
}

Stream.prototype.exit = function(exitCode) {
  this.exitCode = exitCode;
  this.emit('exit', exitCode);

  if (this.output) {
    this.output.header = this.output.header + ' (done)';
    this.write('\nExited with code: ' + exitCode + '\n');
    this.end();
  } else {
    this.end();
  }
};

module.exports = Stream;
