#!/bin/bash
node ../main.js &
node ./test.js | node ../main.js -t &
node ./test.js | node ../main.js -t &
node ./test.js | node ../main.js -t &
node ./test.js | node ../main.js -t &
node ./test.js | node ../main.js -t &
node ./test.js | node ../main.js -t