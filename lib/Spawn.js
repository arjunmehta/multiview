var spawn = require('child_process').spawn;

function Spawn(stream, command, args, name, output) {

    var exited = false;
    var ended = false;
    var spawned_process;

    this.id = name;

    spawned_process = spawn(command, args);

    if (output) {
        spawned_process.stdout.pipe(output.stdin);
        spawned_process.stderr.pipe(output.stdin);
    }

    if (stream) {

        spawned_process.stdout.pipe(stream, {
            end: false
        });

        spawned_process.stderr.pipe(stream, {
            end: false
        });

        spawned_process.stdout.on('end', function() {
            ended = true;
            if (exited !== false) {
                stream.exit(exited);
            }
        });

        spawned_process.on('exit', function(code, signal) {
            exited = code;
            if (ended !== false) {
                stream.exit(exited);
            }
        });

        spawned_process.on('error', function(err) {
            stream.exit(1);
        });
    }

    return spawned_process;
}


module.exports = Spawn;
