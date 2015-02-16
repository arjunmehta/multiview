var mv = require('multiview')
mv.spawn


## mv core
mv.stream()
pipes any writes to the mv core view. must manually call .exit() to track exits. Closes automatically, unless pipe({end: false})

if exit() is called before end(), change view header and ends stream.
if exit() is called after end(), change view header only.

mv.spawn()
automatically pipes spawn output to mv.core view. captures exit codes

mv.createServer();