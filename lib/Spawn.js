var spawn = require('child_process').spawn;

function Spawn(stream, command, args, name) {

    var _this = this,
        exited = false,
        ended = false,
        process = spawn(command, args);
        
    this.id = name;

    process.stdout.pipe(stream, {
        end: false
    });
    process.stderr.pipe(stream, {
        end: false
    });

    process.stdout.on('end', function(code) {
        ended = true;
        if (exited !== false) {
            stream.exit(exited);
        }
    });

    process.on('exit', function(code) {
        exited = code;
        if (ended !== false) {
            stream.exit(exited);
        }
    });

    process.on('error', function(err) {
        stream.exit('Error: ' + err);
    });

    return process;
}


module.exports = exports = Spawn;
