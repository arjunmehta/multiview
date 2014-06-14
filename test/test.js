// var timer = parseInt(Math.random()*3000, 10);
var timer = 10;

setInterval(function(){
  process.stdout.write("TESTING PIPE" + process.pid +" " +Math.random()*2987324872398476239847); 
},timer);

process.stdout.on('error', function(err) {
    console.error(err);
    process.exit(0);
});