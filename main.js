
// multiview - bash stdout utility written for node.js
// Copyright (c) 2014 Arjun Mehta
// MIT License
//


var program = require('commander');
var app;


program
  .version('0.0.1')
  .option('-p, --presenter', 'Make it a Presenter')
  .option('-t, --terminal [name]', 'Make it a terminal with an optional name. (Default: ProcessPID)')
  .option('-c, --channel [name]', 'Specify channel name. (Default: columnview)', 'columnview')
  .parse(process.argv);


if(program.terminal !== undefined){
  require('./lib/terminal.js')(program);
}
else{
  require('./lib/presenter.js')(program);
}

