#!/bin/bash
node ./main.js &
sleep 1; node ./test/test.js | node ./main.js -t A &
node ./test/test.js | node ./main.js -t B &
node ./test/test.js | node ./main.js -t Another &
node ./test/test.js | node ./main.js -t Testing123 &
node ./test/test.js | node ./main.js -t SomethingElse &
node ./test/test.js | node ./main.js -t "Something Else"

