#!/usr/bin/env node

// Copyright (c) 2015 Arjun Mehta
// MIT License

var protogram = require('protogram');
var help = require('protogram-help');
var action = require('./cli/action');

var indexOfPipe;

var program = protogram.create({
  optional: 'command(s)',
  action: action
});


program
  .command('*', {
    includeRoot: true
  })
  .option('--help', help);

program
  .option('--autoexit', {
    optional: 'delay',
    shortcut: '-x',
    description: 'Exit automatically after all processes have finished. (default delay: 500ms)',
    default: 'multiview_main'
  })
  .option('--print', {
    description: 'Linearly print results of each stream after exiting.'
  })
  .option('--efficient', {
    description: 'Render process output efficiently – great for remote connections'
  })
  .option('--buffer', {
    required: 'buffer size',
    description: 'Limit the number of lines buffered for each process. (default: 2000)',
    default: 2000
  })
  .option('--stream', {
    optional: 'stream name',
    description: "Stream the output of this instance to a display instance. (default name: the stream's PID)"
  })
  .option('--channel', {
    required: 'channel name',
    description: 'Specify a channel name. (default: multiview_main)',
    default: 'multiview_main'
  });

while (process.argv.indexOf('|') > -1) {
  indexOfPipe = process.argv.indexOf('|');
  process.argv[indexOfPipe - 1] = process.argv[indexOfPipe - 1] + ']';
  process.argv[indexOfPipe + 1] = '[' + process.argv[indexOfPipe + 1];
  process.argv[indexOfPipe] = 'PIPE';
}

program.parse(process.argv);
