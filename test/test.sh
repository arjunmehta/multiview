#!/bin/bash
node ./test/test.js | node ./main.js -s A &
node ./test/test.js | node ./main.js -s B &
node ./test/test.js | node ./main.js -s Another &
node ./test/test.js | node ./main.js -s Testing123 &
node ./test/test.js | node ./main.js -s SomethingElse &
node ./test/test.js | node ./main.js -s "Something Else" &
node ./main.js

# "node ./main.js" "node ./test/test.js | node ./main.js -t A" "node ./test/test.js | node ./main.js -t A" "node ./test/test.js | node ./main.js -t A" "node ./test/test.js | node ./main.js -t A" 
