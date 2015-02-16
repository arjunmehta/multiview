var keypress = require('keypress');

function Controls(autoexit) {
    if (!autoexit) {
    	
        if (process.stdin.isTTY) {

            keypress(process.stdin);
            process.stdin.setRawMode(true);

            process.stdin.on('keypress', function(ch, key) {
                if (key && ((key.ctrl && key.name == 'c') || key.name == 'q')) {
                    process.stdin.pause();
                    process.exit(0);
                }
            });
        }
    }
}
