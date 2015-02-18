var columns = require('columns');

function Receiver(opts) {

    opts = opts || {};

    this.view = columns.create({
        column_separator: '  ',
        flow_mode: opts.efficient ? 'reset' : 'push',
        // mode: 'debug'
    });
}

Receiver.prototype.newStream = function(stream) {
    return this.view.addColumn(stream.id, {raw: true});
};

module.exports = exports = Receiver;
