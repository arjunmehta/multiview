var timer = parseInt(Math.random()*1000, 10);
// var timer = 50;

if (process.stdout.isTTY){
  console.log('not redirected');
}
else {
  console.log('redirected');
}

setInterval(function(){
  process.stdout.write("TESTING PIPE" + process.pid +" " +Math.random()*2987324872398476239847); 
},timer);

process.stdout.on('error', function(err) {
    console.error(err);
    process.exit(0);
});