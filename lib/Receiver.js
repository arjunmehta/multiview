var Streamer = require('./Stream');
var columns = require('columns');

function Receiver(opts) {

    this.view = columns.create({
        column_separator: '  ',
        // flow_mode: 'reset',
        // mode: 'debug'
    });
}

Receiver.prototype.newStream = function(stream) {
    return this.view.addColumn(stream.id);
};

module.exports = exports = initialize;
