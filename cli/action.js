var unparse = require('unparse-args');
var keypress = require('keypress');

var MultiView = require('../main');
var Streamer = require('./Streamer');
var Spawn = require('../lib/Spawn');
var startServer = require('./startServer');


function setStream(args, flags, channel) {
  var name = typeof flags.stream !== 'boolean' ? flags.stream.toString() : 'PID:' + process.pid;
  var command;
  var commandArgs;
  var streamer;
  var streamers = [];
  var streamerCount = 0;
  var streamerEnded = 0;
  var unparsedArgs;
  var i;

  var stdinStreamer = new Streamer(name, channel, {
    logConnectMessages: false
  });

  streamers.push(stdinStreamer);

  process.stdin.pipe(stdinStreamer, {
    end: false
  });

  process.stdin.on('end', function() {
    stdinStreamer.exit(0);
  });

  for (i = 0; i < args.length; i++) {
    if (typeof args[i]._ === 'object') {
      unparsedArgs = unparse(args[i]);
      command = unparsedArgs[0];
      commandArgs = unparsedArgs.slice(1);

      streamer = new Streamer(unparsedArgs.join(' '), channel);
      streamers.push(streamer);

      Spawn(
        streamer,
        command,
        commandArgs,
        command + (commandArgs ? ' ' + commandArgs.join(' ') : '')
      );
    }
  }

  for (i = 0; i < streamers.length; i++) {
    streamers[i].on('socketBegun', function() {
      streamerCount++;
    });

    streamers[i].on('socketEnded', function() {
      streamerEnded++;
      if (streamerEnded === streamerCount) {
        process.exit(0);
      }
    });
  }
}


function setMain(args, flags, channel) {
  var mv = new MultiView(flags);
  var exitCount = 0;
  var exitCode = 0;
  var autoexit = flags.autoexit !== undefined ? (typeof flags.autoexit === 'number' ? flags.autoexit : 500) : false;
  var argGroups;

  startServer(mv, channel);

  mv.on('exit', function(stream, code) {
    exitCount++;

    if (exitCode === 0 && code !== 0) {
      exitCode = code;
    }
  });

  if (autoexit !== false) {
    mv.on('exit', function(stream, code) {
      setTimeout(function() {
        if (exitCount === mv.streams.length) {
          process.exit(exitCode);
        }
      }, autoexit);
    });
  }

  if (process.stdin.isTTY) {
    keypress(process.stdin);
    process.stdin.setRawMode(true);

    process.stdin.on('keypress', function(ch, key) {
      if (key && ((key.ctrl && key.name === 'c') || key.name === 'q')) {
        process.stdin.pause();
        process.exit(exitCode);
      }
    });
  }

  argGroups = buildSpawnOrder(args);
  spawnArgGroups(mv, argGroups);
}

function buildSpawnOrder(args) {
  var order = [
    []
  ];
  var i = 0;
  var j = 0;

  for (i = 0; i < args.length; i++) {
    if (typeof args[i]._ === 'object') {
      order[j].push(unparse(args[i]));
    }
    if (args[i + 1] !== 'PIPE' && i < args.length - 1) {
      j++;
      order[j] = [];
    } else {
      i++;
    }
  }

  return order;
}

function spawnArgGroups(mv, argGroups) {
  var args;
  var unparsedArgs;
  var piper;
  var options;
  var piperName;

  var i;
  var j;

  for (i = 0; i < argGroups.length; i++) {
    args = argGroups[i];
    piperName = generateName(args);
    piper = null;

    for (j = args.length - 1; j >= 0; j--) {
      options = {};
      unparsedArgs = args[j];

      if (piper) {
        options.stdout = piper;
        options.silent = true;
      } else {
        options.name = piperName;
      }

      piper = mv.spawn(unparsedArgs[0], unparsedArgs.slice(1), options);
    }
  }
}

function generateName(args) {
  var name = '';
  var i;

  for (i = 0; i < args.length; i++) {
    name += (i > 0 ? ' | ' : '') + args[i].join(' ');
  }

  return name;
}


module.exports = function(args, flags) {
  var channel = flags.channel || 'multiview_main';

  if (flags.help || flags.version) {
    // don't do anything if help selected
  } else if (flags.stream) {
    setStream(args, flags, channel);
  } else {
    setMain(args, flags, channel);
  }
};
