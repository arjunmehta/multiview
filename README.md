# multiview

A utility to execute multiple processes and channel their outputs into separate little column views. This package provides:

- **a CLI tool to spawn multiple processes and concurrently view their output.**
- **a node/io.js module to do the same.**
- **handles ANSI output from processes.**
- **presents all spawned process outputs neatly into columns.**
- **choice of display efficiency modes.**
- **error handling and exit code transmission.**
- **stream support.**

There are two ways of using multiview: as a **CLI tool**, or as a **node/io.js module**:

## The CLI Tool: Basic Usage

### Installation
```bash
npm install -g multiview
```

### CLI Usage Example
The CLI tool can spawn multiple processes and will separate their outputs into columns. Just execute the cli command `multiview` and place each sub-command into their own square brackets `[]`.

```bash
multiview [ls -l] [node --help] [find ../ node_modules]
```

### CLI Usage Example (UNIX Piping)
The CLI tool also supports piping using standard UNIX piping conventions. Just pipe to a new instance of `multiview -s`/`multiview --stream` to capture its output. Then execute a final multiview instance to display. Like so:

```bash
(ls -l | multiview -s) & (node --help | multiview -s) & (find ../ node_modules | multiview -s) & multiview
```

**Note:** *This method can't capture process name, exit codes, and can't differentiate between stdout/stderr.*

## The Module: Basic Usage

Multiview can also be used as a module in your node/io.js projects. The module can spawn new processes and will display them in a neat column view.

### Installation
```bash
npm install --save multiview
```

### Include
```javascript
var multiview = require('multiview')
```

### Spawn Processes
Each call to `multiview.spawn()` creates a new process which behaves like a regular spawn instance. View advanced usage to see how you can take advantage of this.

```javascript
multiview.spawn('ls', ['-l'])
multiview.spawn('node', ['--help']);
multiview.spawn('find', ['../', 'node_modules'])
```

```javascript
multiview.out(channel).pipe()
```

## The CLI Tool: Advanced Usage

```bash
Usage: multiview [command(s)] [options]
Options:
    -h, --help               output usage information
    -V, --version            output the version number
    -s, --stream [name]      instantiate as a stream provider with an optional name. (default: the stream's PID)
    -c, --channel [name]     specify a channel name to stream to/from. (default: multiview_main)
    -e, --efficient          use this option for rendering process output efficiently. Useful when connected remotely and reduces terminal cpu usage.
    -E, --autoexit           exit automatically, passing the first exit code received, if there is one.
```


## The Module: Advanced Usage

### Global Options
```bash
var multiview = require('multiview')({    
    efficient: true
})
```

### Global Events
```javascript
multiview.on('spawn_exit', function(process, code, signal){})
multiview.on('spawn_close', function(process, code, signal){})
multiview.on('spawn_error', function(process, err){})
multiview.on('spawn_disconnect', function(process){})
multiview.on('spawn_message', function(process, message, sendHandle){})
```

### Process Options
```javascript
var s = multiview.spawn('ls', ['-l'], { 
    wrap: true, 
    header: 'Process A'
})
```

### Process Events

```javascript
s.on('exit', function(code, signal){})
s.on('close', function(code, signal){})
s.on('error', function(err){})
s.on('disconnect', function(){})
s.on('message', function(message, sendHandle){})
```


### Piping
Because spawned processes are native node spawned processes, you can pipe their output, or even write to them by writing to their stdin.

```javascript
s.stdout.pipe(fs.writeStream);
s.stderr.pipe(fs.writeStream);
process.stdin.pipe(s.stdin);
```

**Note:** *You probably want to avoid piping the spawn'ed process's stdout to your main stdout, since it will interfere with the rendering of column output.*



## Multiview Interface
There are two ways of instantiating and using `multiview`. As a **display**, or as a **stream**. When you run your shell processes, you pipe your stdouts to stream instances of multiview which forward this stdout to display instances to be presented in an accessible column view.

### Displays
By default multiview launches as a display. A display instance displays stdout information from multiple processes in neat columns. To launch a display, it's as simple as:

```bash
multiview
```

### Exit the CLI Tool

#### Automatically
If you want to exit the CLI tool automatically after all processes have finished, you can just use the `--autoexit`/`-e` flag.

```bash
multiview [ls -l] [node --help] [find ../ node_modules] --autoexit
```

If all of the processes end with no error, multiview will exit with no errors. If any of the spawned processes end with an error, multiview will exit with the error code of the first process to exit with an error, and will print out all the other error codes of any other processes as well. If you'd prefer not to show error codes use the `--silent`/`-s` option.

```bash
multiview [ls -l] [node --help] [find ../ node_modules] --autoexit
```


#### Manually
Exit the display by pressing `q` or `ctrl+c`.

### Streams
Streams take stdout information from a process using a standard UNIX pipe `|` and forward it to a display instance. You can of course also combine pipe stderr with `|&` instead if you'd like to forward that along as well. Use a display instance by piping output from any process that has an stdout as follows:

```bash
myProcess | multiview -s
myProcess |& multiview -s
```

You can also optionally give your stream instance a name. If this isn't specified the name will be the PID of the stream process.

```bash
myProcess | multiview -s "My Process Name"
```

Active streams show up with a green header in the display, while inactive/completed streams have grey headers.

### Channels
Channels allow you to have different sets of stdout streams going to different display instances. To use channels, both your stream instances and display instance need to be set to the same channel:

```bash
# for streams:
myProcess | multiview -s -c channelName

# for displays:
multiview -c channelName
```

By default, multiview runs on a channel called `multiview_main`

### Flow Mode

Multiview has the potential to either be really efficient in how it presents data, or really inefficient (but perhaps more user friendly). By default, multiview display columns will be pretty efficient, but if you want to emulate the scrolling effect of a regular terminal you can enable **flow mode**.

```bash
multiview -f
```

 This emulates the scrolling feed feel of a normal terminal, but is quite inefficient as it needs to redraw the output for every new input. Users working remotely should take note.

### Full Usage Information

```bash
Usage: multiview [options]
Options:
    -h, --help               output usage information
    -V, --version            output the version number
    -s, --stream [name]      make it a stream with an optional name. (default: the stream's PID)
    -c, --channel [name]     specify channel name. (default: multiview_main)
    -f, --flow               if this is a display, scroll new content in each column like a normal terminal. WARNING: This can be bandwidth intensive on remote connections
```


## License
```
The MIT License (MIT)
Copyright (c) 2015 Arjun Mehta
```
