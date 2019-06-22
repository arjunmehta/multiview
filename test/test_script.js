var timer = parseInt(Math.random() * 1000, 10);
var count = 0;


if (process.stdout.isTTY) {
  console.log('not redirected');
} else {
  console.log('\u001b[31mredirected ' + new Date().getMilliseconds() + '\u001b[0m');
  console.log('\u001b[32mTest ' + new Date().getMilliseconds() + '\u001b[0m');
}

setInterval(function() {
  if (count > 100) {
    process.exit(1);
  }
  process.stdout.write('TESTING PIPE' + process.pid + ' ' + (count++) + ' ' + Math.random() * 298732487847 + '\n');
}, timer);

process.stdout.on('error', function() {
  process.exit(0);
});
