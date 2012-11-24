
var util = require('util');
var Stream = require('stream').Stream;
var net = require('net');

var Remote = require('./remote');

var ini = require('ini');
var remote = require('./remote');

var stream = new Stream();

var Repo = module.exports = function Repo(opts) {

  if (!(this instanceof Repo)) {
    return new Repo(opts);
  }

  Stream.call(this);

  var that = this;

  that.refs = {};
  that.name = opts.name;
  that.path = opts.path || (process.cwd() + './git');
  that.remote = remote;

  that.writable = true;
  that.readable = true;

  //
  // Invoked by git `send-pack` (push) and updates 
  // the repository with the information fed from 
  // the remote end. The command allows for creation 
  // and fast-forwarding of sha1 refs (heads/tags) 
  // on the remote end.
  //
  var data = '';

  stream.on('data', function(msg) {

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
      // The first message we receive should be a `send-pack`.
      // We should immediately respond with a listing of each 
      // reference it has (all branches and tags) along
      // with the object name that each reference currently 
      // points to.
      //
      if (type === 'send-pack') {

        socket.write({
          meta: {
            type: 'receive-pack',
          }
          data: that.refs
        });
      }

      //
      // Clients MUST send all the obj-ids it wants from the
      // reference discovery phase as 'want' lines. Clients
      // MUST send at least one 'want' command in the request
      // body. Clients MUST NOT mention an obj-id in a 'want'
      // command which did not appear in the response obtained
      // through ref discovery.
      //
      else if (type === 'want-list') {

        var wantlist = data;
        var wants = Object.keys(wantlist).length;

        if (wants > 0) {
          
          for (want in wantslist) {
            if (want === 'ACK') {

            }
            else if (want === 'NAK') {
              //
              // server always sends a NAK when its done.
              // at this point we can terminate the socket.
              //
              stream.end();
            }
            else if (want === 'shallow') {
              //
              // 
              //
              //
            }
            else if (want === 'deepen') {
            
            }
            else if (want === 'want') {
            
            }
          }


          //
          // TODO:
          // Iterate though this list and get the values out 
          // of the repo and then send them back.
          //

          socket.write({
            meta: {
              type: 'have-list',
            }
            data: {
              path: that.refs
            }
          });
        }
        else {

          socket.end();
        }
      }
    }
    else {

      //
      // TODO: consume binary data streamed in.
      // consume
      //
    }
  }
};

util.inherits(Repo, Stream);

Git.prototype.push = require('./lib/push');
// Git.prototype.add = require('./lib/add');
// Git.prototype.commit = require('./lib/commit');

Repo.prototype.write = function(data) {
  this.pull(data);
};

Repo.prototype.read = function(data) {

  this.push(data);
};

Repo.prototype.end = function(data) {

};


Repo.prototype.config = {

  getAll: function(opts, callback) {

    if (opts.path) {

      fs.stat(opts.path, function(err) {

        if (err) {

          callback(err);
        }
        else {
        
          fs.readFile(opts.path, function(data) {

            callback(null, ini.parse(data));
          });
        }
      });
    }
  }

};

