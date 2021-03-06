var Stream = require('stream').Stream,
    fsm = require('../fsm');

module.exports.unpack = require('./unpack');
module.exports.pack = require('./pack');

module.exports.createParserStream = function() {

  var s = new Stream();
  s.writable = true;
  s.paused = false;

  var obj = {
    fanout : [],
    entries : []
  };

  var parser = fsm({

    'ident' : fsm.want(4, function(buffer) {
      obj.ident = buffer;
      this.change('version')
    }),

    'version' : fsm.want(4, function(buffer) {
      obj.version = buffer.readUInt32BE(0);
      this.change('first level fanout');
    }),

    'first level fanout' : fsm.want(4, function(buffer) {
      obj.fanout.push(buffer.readUInt32BE(0));

      if (obj.fanout.length === 256) {
        obj.total = obj.fanout[obj.fanout.length-1];
        this.change('entries')
      }
    }),

    'entries' : fsm.want(20, function(buffer) {
      obj.entries.push({
        sha : buffer.toString('hex')
      });

      if (obj.entries.length >= obj.total) {
        this.change('crc32')
      }
    }),

    'crc32' : fsm.want(4, function(buffer, i) {
      obj.entries[i].crc32 = buffer.toString('hex');
      if (i >= obj.entries.length - 1) {
        this.change('small offset');
      }
    }),

    'small offset' : fsm.want(4, function(buffer, i) {
      obj.entries[i].offset = buffer.readUInt32BE(0);
      if (i >= obj.entries.length - 1) {
        // TODO: >4gb packfiles
        // basically this means the offsets that we collected
        // are indexes into another larger table
        //this.change('pack offset');
        this.change('packfile checksum');
      }
    }),

    'pack offset' : fsm.want(8, function(buffer, i) {
      obj.entries[i].largeOffset = buffer.readDoubleBE(0);
      if (i >= obj.entries.length - 1) {
        this.change('packfile checksum');
      }
    }),

    'packfile checksum' : fsm.want(20, function(buffer) {
      obj.packfileChecksum = buffer.toString('hex');
      this.change('indexfile checksum');
    }),

    'indexfile checksum' : fsm.want(20, function(buffer) {
      obj.indexfileChecksum = buffer.toString('hex');
      this.done(obj);
    })

  }, function(obj) {
    s.end(obj);
  });


  s.write = parser;

  s.end = function(data) {
    this.emit('end', data);
  };

  return s;
};
