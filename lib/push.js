
//
// This is a `send-pack` implementation from 
// the packfile transfer protocol.
//
var net = require('net');
var Stream = require('stream').Stream;

var objects = require('../../lib/objects');

var push = module.exports = function push(opts) {

  var that = this;

  var remote, branch, port, host;

  //
  // if the opts is just the name of an origin,
  // try to find that origin in the config.
  //
  if (typeof opts === 'string') {

    if (!that.config || !that.config.remote || !that.config.remote[opts]) {
      throw new Error('No compatible remote named `' + opts + '`');
    }
    else if (that.config.remote[opts].host) {
      remote = that.config.remote[opts];
    }
  }

  remote = opts.remote;
  branch = opts.branch || 'master';

  //
  // We want to 'fetch' data from another repo.
  // This operation determines what data the server 
  // has that the client does not then streams that
  // data down to the client in packfile format.
  //
  this.server = net.createConnection({ 
    host: remote.host, 
    port: remote.port 
  },
  function(socket) {

    //
    // git does some funky shit to tell the server who
    // is sending the request and what they want. We can
    // simplify that a lot by using tcp and a data 
    // structure that always has a meta chunk and a data 
    // chunk.
    //

    socket.write({
      meta: {
        type: 'send-pack',
      }
      data: {
        path: that.repo.name
      }
    });

    //
    // When the client initially connects, the server 
    // will immediately respond with a listing of each 
    // reference it has (all branches and tags) along
    // with the object name that each reference currently 
    // points to.
    //
    var data = '';
    var mode = 'utf8';

    socket.on('data', function(msg) {

      data += msg.toString();

      var parts = data.split('\n');
      data = parts.pop();

      parts.forEach(function (part) {
        processData(part);
      });
    }); 

    var processData = function processData(part) {

      var json = false;

      try {
        json = JSON.parse(part));
      } catch(_) {}

      //
      // During the negotiation phase we will receive
      // JSON, after that the packfiles will be sent
      // in binary format.
      //
      if (json) {

        var type = json.meta.type;
        var data = json.data;

        //
        // After reference discovery, the client can decide to 
        // terminate the connection if it does not need any pack
        // data. This can happen when the client is up-to-date.
        //
        if (type === 'receive-pack') {

          var havelist = data;

          //
          // If there are wants, we enter the negotiation phase, 
          // where the client and server determine what the minimal 
          // packfile necessary for transport is.
          //
          // The client MUST write all obj-ids which it only has 
          // shallow copies of (meaning that it does not have the 
          // parents of a commit) as 'shallow' lines so that the 
          // server is aware of the limitations of the client's 
          // history. Clients MUST NOT mention an obj-id which it 
          // does not know exists on the server.
          //

          //
          // TODO:
          // if our list is missing refs we want to bubble up
          // an event that explains why we are not up to date.
          //

          //
          // TODO: 
          // create `want-list` by comaring what is in the 
          // idx to what is in the `have-list`.
          //
          var wantlist = {};
          var wants = Object.keys(wantlist).length;

          if (wants > 0) {

            socket.write({
              meta: {
                type: 'want-list',
              }
              data: wantlist
            });
          }
          else {
            socket.end();
          }
        }
      }
      else {

        //
        // TODO: 
        // consume the binary data that is sent in the packfile.
        //

      }
    }

  });

  return this.server;
};

util.inherits(Repo, Stream);
