#!/bin/bash
node ./test/test.js | node ./cli.js -s A -c testing &
node ./test/test.js | node ./cli.js -s B -c testing &
node ./test/test.js | node ./cli.js -s Another -c testing &
node ./test/test.js | node ./cli.js -s Testing123 -c testing &
node ./test/test.js | node ./cli.js -s SomethingElse -c testing &
node ./test/test.js | node ./cli.js -s "Something Else" -c testing &
node ./cli.js -c testing

# "node ./main.js" "node ./test/test.js | node ./main.js -t A" "node ./test/test.js | node ./main.js -t A" "node ./test/test.js | node ./main.js -t A" "node ./test/test.js | node ./main.js -t A" 
