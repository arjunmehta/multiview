var util = require('util');
var net = require('net');
var fs = require('fs');

var headerfooter = require('stream-headerfooter');

var EventEmitter = require("events").EventEmitter;
util.inherits(Server, EventEmitter);


// Main Constructor

function Server(main, channel) {

    EventEmitter.call(this);

    var socketPath = __dirname + '/' + channel + '.sock',
        server = net.createServer();

    server.on('error', function(e) {

        if (e.code == 'EADDRINUSE') {

            var clientSocket = new net.Socket({
                readableObjectMode: true
            });

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
            }, function() {});
        }
    });

    server.on('connection', function(socket) {

        var stream,
            pipet = new headerfooter.In();

        socket.pipe(pipet);

        pipet.on('header', function(header) {
            stream = main.stream(header.id);
            pipet.pipe(stream);
        });

        pipet.on('footer', function(footer) {
            if (footer.exitCode !== undefined) {
                stream.exit(footer.exitCode);
            }
        });
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


module.exports = Server;
