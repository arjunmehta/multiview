// Copyright (c) 2015 Arjun Mehta
// MIT License


var protogram = require('protogram');
var help = require('protogram-help');
var action = require('./cli/action');

var program = protogram.create({
    optional: "command(s)",
    action: action
});

program
    .command('*', {
        includeRoot: true
    })
    .option('--help', help);

program
    .option('--stream', {
        optional: 'stream name',
        description: "Stream the output of this instance to a display instance. (default name: the stream's PID)"
    })
    .option('--channel', {
        required: 'channel name', 
        description: 'Specify a channel name. (default: multiview_main)',
        default: 'multiview_main'
    })
    .option('--autoexit', {
        optional: 'delay', 
        shortcut: '-x',
        description: 'Exit automatically after all processes have finished. (default delay: 500ms)',
        default: 'multiview_main'
    })
    .option('--efficient', {
        description: 'Render process output efficiently – great for remote connections'
    });

program.parse(process.argv);
