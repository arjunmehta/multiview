node-multiview
==============

A terminal utility that channels multiple stdouts and presents them neatly in a navigable column view.

## Basic Use

### Installation
```bash
npm install -g multiview
```

### Usage Example
This utility is used from the command line using pipes and

```bash
multiview & node processA.js | multiview -t & node processB.js | multiview -t
```

### Options
```bash
 Options:

    -h, --help             output usage information
    -V, --version          output the version number
    -p, --presenter        make it a presenter instance
    -t, --terminal [name]  make it a terminal instance with an optional name (default: processPID)
    -c, --channel [name]   specify channel name (default: columnview)
```

## How it works

There are two types of instances of multiview. One is a presenter `multiview` and the other is a terminal `multiview -t`. You pipe your concurrent processes

Whatever is piped to a terminal gets pushed to a UNIX socket and that socket in turn is read and formatted by the presenter.

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