var timer = parseInt(Math.random()*1000, 10);
// var timer = 50;

var count = 0;

if(process.stdout.isTTY){
  console.log('not redirected');
}
else {
  console.log('redirected');
}

setInterval(function(){
  if(count > 100){
    process.exit(1);
  }
  process.stdout.write("TESTING PIPE" + process.pid +" " + (count++) + " " + Math.random()*298732487847 + "\n"); 
},timer);

process.stdout.on('error', function(err) {
    console.error(err);
    process.exit(0);
});