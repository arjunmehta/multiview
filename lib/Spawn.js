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
      // 'exit' callback cannot perform asynchronous work
      // therefore run tree-kill in a subprocess using spawnSync.
      
      // Resolve the path to tree-kill as we cannot assume our
      // subprocess will have the same module resolution as this package
      // due to the way node_modules is nested by package managers
      var treeKillModulePath = require.resolve('tree-kill');
      var script = 'require("' + treeKillModulePath + '")(' + spawnedProcess.pid + ');';
      var spawnOptions = { stdio: 'inherit' };
      child_process.spawnSync(process.execPath, ['--eval', script], spawnOptions);
    }
  });

  return spawnedProcess;
}


module.exports = Spawn;
