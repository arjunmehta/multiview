
// multiview - shell stdout column view utility written for node.js
// Copyright (c) 2014 Arjun Mehta
// MIT License
//


var program = require('commander');
var app;


program
  .version('0.0.1')
  .option('-n, --num_columns [num]', 'limit the number of columns to display at a time (default: max)', 'max')
  .option('-e, --efficient [num]', 'make the display efficient', 'efficient:max')
  .option('-s, --stream [name]', "make it a stream with an optional name. (default: the stream's PID)")
  .option('-c, --channel [name]', 'specify channel name. (default: multiview_main)', 'multiview_main')
  .parse(process.argv);


if(program.stream !== undefined){
  require('./lib/terminal.js')(program);
}
else{
  require('./lib/presenter.js')(program);
}

