var spawn = require('child_process').spawn;

function Spawn(stream, command, args, name, output) {
  var exited = false;
  var ended = false;
  var spawnedProcess = spawn(command, args);

  this.id = name;

  if (output) {
    spawnedProcess.stdout.pipe(output.stdin);
    spawnedProcess.stderr.pipe(output.stdin);
  }

  if (stream) {
    spawnedProcess.stdout.pipe(stream, {
      end: false
    });

    spawnedProcess.stderr.pipe(stream, {
      end: false
    });

    spawnedProcess.stdout.on('end', function() {
      ended = true;
      if (exited !== false) {
        stream.exit(exited);
      }
    });

    spawnedProcess.on('exit', function(code, signal) {
      exited = code;
      if (ended !== false) {
        stream.exit(exited);
      }
    });

    spawnedProcess.on('error', function() {
      stream.exit(1);
    });
  }

  process.on('exit', function(code) {
    if (exited === false) {
      spawnedProcess.kill();
    }
  });

  return spawnedProcess;
}


module.exports = Spawn;
