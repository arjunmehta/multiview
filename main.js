#!/usr/bin/env node

// multiview - shell stdout column view utility written for node.js
// Copyright (c) 2014 Arjun Mehta
// MIT License
//

var byline = require('byline');
var program = require('commander');

var input;

program
  .version('0.1.0')
  .option('-s, --stream [name]', "make it a stream with an optional name. (default: the stream's PID)")
  .option('-c, --channel [name]', 'specify channel name. (default: multiview_main)', 'multiview_main')  
  .option('-f, --flow', 'if this is a display, scroll new content in each column like a normal terminal. WARNING: This can be bandwidth intensive on remote connections')  
  .option('-n, --num_columns [num]', 'limit the number of columns to display at a time (default: max)', 'max')
  .parse(process.argv);


if(program.stream !== undefined){
  // input = byline(process.stdin);
  // input.on('data', function(data){
  //   console.log(data);
  // });
  require('./lib/terminal.js')(program);
}
else{
  require('./lib/presenter.js')(program);
}

