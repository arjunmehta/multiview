var columns = require('columns');

function Receiver(opts) {
  opts = opts || {};

  this.view = columns.create({
    column_separator: '  ',
    flow_mode: opts.efficient ? 'reset' : 'push',
    print: opts.print,
    maximum_buffer: opts.buffer || 2000
  });
}

Receiver.prototype.newStream = function(stream) {
  var column = this.view.addColumn({
    header: stream.id
  });
  return column;
};

module.exports = exports = Receiver;
