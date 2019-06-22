var treeKill = require('tree-kill');

var processID = parseInt(process.argv[2]);

treeKill(processID, function(err) {
  if (err) {
    console.error(err.stack || err);
  }
});
