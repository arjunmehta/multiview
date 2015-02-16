var spawn = require('child_process').spawn;

function Spawn(main, command, args, opts) {

    var _this = this,
        exited = false,
        ended = false,
        process = spawn(command, args),
        id = opts.name || command + (args ? ' ' + args.join(' ') : '');

    var stream = main.stream(id);

    this.id = id;

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
