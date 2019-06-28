var childProcess = require('child_process');
var path = require('path');

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

  spawnedProcess = childProcess.spawn(command, args, options);

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
      // 'exit' callback cannot perform asynchronous work
      // therefore run standalone-treekill in a subprocess using spawnSync.
      // assuming standalone-treekill.js in same directory as Spawn.js
      var treeKillScriptPath = path.resolve(__dirname, 'standalone-treekill.js');
      var spawnOptions = { stdio: 'inherit' };
      childProcess.spawnSync(process.execPath, [treeKillScriptPath, spawnedProcess.pid], spawnOptions);
    }
  });

  return spawnedProcess;
}


module.exports = Spawn;
