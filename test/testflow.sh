#!/bin/bash
node ./test/test.js |& node ./main.js -s A -c testing &
node ./test/test.js |& node ./main.js -s B -c testing &
node ./test/test.js |& node ./main.js -s Another -c testing &
node ./test/test.js |& node ./main.js -s Testing123 -c testing &
node ./test/test.js |& node ./main.js -s SomethingElse -c testing &
node ./test/test.js |& node ./main.js -s "Something Else" -c testing &
node ./main.js -c testing -f

