var timer = parseInt(Math.random()*1000, 10);
// var timer = 50;

var count = 0;

if(process.stdout.isTTY){
  console.log('not redirected');
}
else {
  console.log('\033[31mredirected ' + new Date().getMilliseconds() + "\033[0m");
  console.log('\033[32mTest ' + new Date().getMilliseconds() + "\033[0m");
}

// process.exit(0);

setInterval(function(){
  if(count > 100){
    process.exit(1);
  }
  process.stdout.write("TESTING PIPE" + process.pid +" " + (count++) + " " + Math.random()*298732487847 + "\n"); 
},timer);

process.stdout.on('error', function(err) {
    process.exit(0);
});