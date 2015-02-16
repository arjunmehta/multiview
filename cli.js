// Copyright (c) 2015 Arjun Mehta
// MIT License


var protogram = require('protogram');
var help = require('protogram-help');

// var MultiView = require('./main');

var Server = require('./lib/Server');
var Streamer = require('./lib/Streamer');


var program = protogram.create({
    optional: "command(s)",
    action: function(args, flags) {

        // var multiview = new MultiView(flags),
        //     controls;

        // for (var arg in args) {
        //     if (typeof args[arg]._ === 'object') {
        //         multiview.spawn(unparse(args[arg]));
        //     }
        // }

        // if (flags.stream) {
        //     if (typeof flags.stream !== 'string') {
        //         flags.stream = 'PID:' + process.pid;
        //     }
        //     process.stdin.pipe(multiview.createStream(flags.stream));
        // } else {
        //     require('./lib/PresenterControls')();
        //     process.stdin.on('end', function() {
        //         process.exit(0);
        //     });
        // }
        if (flags.stream) {
            var a = new Streamer({name:"a"});
            var b = new Streamer({name:"b"});
            var c = new Streamer({name:"c"});

            a.write("Hi there!!!!\n");


            setTimeout(function(){
                a.exit("EXITING AAAAAA\n");
                b.exit("EXITING BEEEEE\n");
                c.exit("EXITING C C C C C C\n");

                // process.exit(0);

            }, 3000);

        } else {
            var server = new Server();
            server.on('connection', function(connection, name){
                console.log("NEW SERVER CONNECTION", name);
                connection.setEncoding('utf8');
                connection.on('data', function(data){
                    console.log(name, "data", data);
                });
                connection.on('exit', function(code){
                    console.log('EXITING', name, code);
                });
            });
        }
    }
});

program
    .command('*', {
        includeRoot: true
    })
    .option('--help', help);

program
    .option('--stream', {
        description: "make it a stream with an optional name. (default: the stream's PID)"
    })
    .option('--channel', {
        description: 'specify channel name. (default: multiview_main)',
        default: 'multiview_main'
    })
    .option('--flow', {
        description: 'if this is a display, scroll new content in each column like a normal terminal. WARNING: This can be bandwidth intensive on remote connections'
    });

program.parse(process.argv);
