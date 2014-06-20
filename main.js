#!/usr/bin/env node

// multiview - shell stdout column view utility written for node.js
// Copyright (c) 2014 Arjun Mehta
// MIT License
//

var byline = require('byline');
var program = require('commander');

var input;

program
  .version('1.1.1')
  .option('-s, --stream [name]', "make it a stream with an optional name. (default: the stream's PID)")
  .option('-c, --channel [name]', 'specify channel name. (default: multiview_main)', 'multiview_main')  
  .option('-f, --flow', 'if this is a display, scroll new content in each column like a normal terminal. WARNING: This can be bandwidth intensive on remote connections')  
  .parse(process.argv);


if(program.stream !== undefined){
  require('./lib/terminal.js')(program);
}
else{
  require('./lib/presenter.js')(program);
}

