var util = require('util');
var net = require('net');
var fs = require('fs');
var split = require('split');

var Router = require('./Router');
var EventEmitter = require("events").EventEmitter;

util.inherits(Server, EventEmitter);

// Main Constructor

function Server(channel) {

    var _this = this;
    
    EventEmitter.call(this);
    channel = channel || 'multiview_main';

    var socketPath = __dirname + '/' + channel + '.sock';
    var router = new Router(this, channel);
    var server = net.createServer();

    server.on('error', function(e) {        

        if (e.code == 'EADDRINUSE') {

            var clientSocket = new net.Socket({readableObjectMode: true});

            clientSocket.on('error', function(e) {
                if (e.code == 'ECONNREFUSED') {
                    fs.unlinkSync(socketPath);
                    server.listen(socketPath, function() {
                        console.log('server recovered');
                    });
                }
            });

            clientSocket.connect({
                path: socketPath
            }, function() {
                _this.emit('error', e);
            });
        }
    });

    server.on('connection', function(socket) {
        // socket.setEncoding('utf8');
        socket.pipe(split()).pipe(router, {end: false});
    });

    server.on('close', function() {
        _this.emit('close');
    });

    server.on('listening', function() {
        _this.emit('listening');
    });

    server.listen(socketPath);

    process.on('exit', function(code) {
        console.log("closing server at:", server.address());
        try {
            server.close();
        } catch (e) {
            console.log("cannot close server, may be already closed");
        }
    });
}


module.exports = exports = Server;
