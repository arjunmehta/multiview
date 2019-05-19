var child_process = require('child_process');

function Spawn(stream, command, args, name, output) {
  var exited = false;
  var ended = false;
  var spawnedProcess;
  var options;

  if (process.platform === 'win32') {
    options = {
      // required so that .bat/.cmd files can be spawned
      shell: process.env.comspec || 'cmd.exe'
    };
  }

  spawnedProcess = child_process.spawn(command, args, options);

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
      if (process.platform === 'win32') {
        // Workaround for kill() not propagating to children of the cmd.exe we launched
        // see https://github.com/nodejs/node/issues/3675#issuecomment-288578092
        child_process.exec('taskkill /F /T /PID ' + spawnedProcess.pid);
      } else {
        spawnedProcess.kill();
      }
    }
  });

  return spawnedProcess;
}


module.exports = Spawn;
