#!/bin/bash
node ./test/test.js | node ./main.js -t A &
node ./test/test.js | node ./main.js -t B &
node ./test/test.js | node ./main.js -t Another &
node ./test/test.js | node ./main.js -t Testing123 &
node ./test/test.js | node ./main.js -t SomethingElse &
node ./test/test.js | node ./main.js -t "Something Else" &
node ./main.js

# "node ./main.js" "node ./test/test.js | node ./main.js -t A" "node ./test/test.js | node ./main.js -t A" "node ./test/test.js | node ./main.js -t A" "node ./test/test.js | node ./main.js -t A" 
