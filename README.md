# node-multiview

A terminal utility that channels multiple stdouts to present them neatly in a navigable column view.

## Getting Started

### Installation
```bash
npm install -g multiview
```

### Usage Example
```bash
(while true; do echo 12; sleep 1; done) | multiview -s StreamA & \
(while true; do echo 34; sleep 2; done) | multiview -s StreamB & \
multiview
```


## Multiview Interface
There are two ways of instantiating and using `multiview`. As a **display**, or as a **stream**. When you run your shell processes, you pipe your stdouts to stream instances of multiview which forward this stdout to display instances to be presented in an accessible column view.

### Displays
By default multiview launches as a display. A display instance displays stdout information from multiple processes in neat columns. To launch a display, it's as simple as:

```bash
multiview
```

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
```


## License
The MIT License (MIT)

Copyright (c) 2014 Arjun Mehta

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.