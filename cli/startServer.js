var net = require('net');
var fs = require('fs');
var path = require('path');

var EventTransmitter = require('event-transmitter');


// Main Constructor

function startServer(main, channel) {
  var socketPath = path.join(__dirname, '/' + channel + '.sock');
  var server = net.createServer();

  server.on('error', function(e) {
    if (e.code === 'EADDRINUSE') {
      var clientSocket = new net.Socket({
        readableObjectMode: true
      });

      clientSocket.on('error', function(e) {
        if (e.code === 'ECONNREFUSED') {
          if (fs.existsSync(socketPath)) {
            fs.unlinkSync(socketPath);
          }

          server.listen(socketPath, function() {
            console.log('server recovered');
          });
        }
      });

      clientSocket.connect({
        path: socketPath
      });
    }
  });

  server.on('connection', function(socket) {
    var stream;
    var eventListener = new EventTransmitter.Listener();

    socket.pipe(eventListener);

    eventListener.on('header', function(header) {
      stream = main.stream(header.id);
      eventListener.pipe(stream);
    });

    eventListener.on('footer', function(footer) {
      if (footer.exitCode !== undefined) {
        stream.exit(footer.exitCode);
      }
    });
  });

  server.listen(socketPath);

  process.on('exit', function(code) {
    console.log('closing server at:', server.address());
    try {
      server.close();
    } catch (e) {
      console.log('cannot close server, may be already closed');
    }
  });
}


module.exports = startServer;
