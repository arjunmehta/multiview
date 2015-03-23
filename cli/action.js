var unparse = require('unparse-args');
var keypress = require('keypress');

var MultiView = require('../main');
var Server = require('./Server');
var Streamer = require('./Streamer');
var Spawn = require('../lib/Spawn');


module.exports = exports = function(args, flags) {

    var spawn_arg,
        unparsed_args,
        channel = flags.channel || 'multiview_main';


    if (flags.help || flags.version) {
        // don't do anything if help selected
    } else if (flags.stream) {

        var name = typeof flags.stream === 'string' ? flags.stream : 'PID:' + process.pid,
            stdin_streamer = new Streamer(name, channel, { logConnectMessages: false }),
            command,
            command_args;

        process.stdin.pipe(stdin_streamer, {
            end: false
        });

        process.stdin.on('end', function() {
            stdin_streamer.exit(0);
        });

        for (spawn_arg in args) {

            if (typeof args[spawn_arg]._ === 'object') {

                unparsed_args = unparse(args[spawn_arg]);
                command = unparsed_args[0];
                command_args = unparsed_args.slice(1);

                new Spawn(new Streamer(unparsed_args.join(' '), channel),
                    command,
                    command_args,
                    command + (command_args ? ' ' + command_args.join(' ') : '')
                );
            }
        }
    } else {

        var mv = new MultiView(flags),
            server = new Server(mv, channel),
            exitCount = 0,
            exitCode = 0,
            autoexit = flags.autoexit !== undefined ? (typeof flags.autoexit === 'number' ? flags.autoexit : 500) : false;

        mv.on('exit', function(stream, code) {
            exitCount++;

            if (exitCode === 0 && code !== 0) {
                exitCode = code;
            }
        });

        if (autoexit !== false) {
            mv.on('exit', function(stream, code) {
                setTimeout(function() {

                    if (exitCount === mv.streams.length) {
                        process.exit(exitCode);
                    }

                }, autoexit);
            });
        }

        if (process.stdin.isTTY) {

            keypress(process.stdin);
            process.stdin.setRawMode(true);

            process.stdin.on('keypress', function(ch, key) {
                if (key && ((key.ctrl && key.name == 'c') || key.name == 'q')) {
                    process.stdin.pause();
                    process.exit(exitCode);
                }
            });
        }

        for (spawn_arg in args) {

            if (typeof args[spawn_arg]._ === 'object') {
                unparsed_args = unparse(args[spawn_arg]);
                mv.spawn(unparsed_args[0], unparsed_args.slice(1));
            }
        }
    }
};
