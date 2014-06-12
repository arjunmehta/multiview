
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



// // process.stdout.write(columnify(data, {maxWidth: 20, preserveNewLines: true}));
// var output = "";
// for (var i = 0; i < numTTYrows*(numTTYcolumns/2); i++) {  
//   if(i%(numTTYcolumns/2-1) === 0){
//     output = "\n";
//   }
//   else{
//     output = parseInt(Math.random()*32, 10).toString(32);
//   }
//   process.stdout.write(output);  
// }

// setInterval(function(){
//   process.stdout.cursorTo(parseInt(Math.random()*numTTYcolumns/2, 10), 29);
//   process.stdout.write("OVERWRITING");
// }, 300);

