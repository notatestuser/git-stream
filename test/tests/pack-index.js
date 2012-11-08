
var fs = require('fs');
var test = require('tap').test;
var repo = require('../fixtures/repo');
var Buffer = require('buffer').Buffer;
var objects = require('../../lib/objects')

var pack = require('../../lib/pack');
var noop = function() { return null };

module.exports = {

  "packfile index: parse stream (one byte at a time)" : function(t) {
    var ps = pack.createParserStream();
    repo.getPackFile(function(err, packFile) {
      t.plan(2 + packFile.verifyObjs.length * 2)
      // delay for binds, and flow of code
      process.nextTick(function() {
        var buffer = packFile.indexBuffer;
        for (var i=0; i<buffer.length;) {
          ps.write(buffer.slice(i, ++i));
        }
      });

      ps.on('end', function(result) {
        t.ok(result.entries, 'found entries');

        t.equal(packFile.verifyObjs.length, result.entries.length);

        result.entries.forEach(function(entry) {
          t.equal(entry.sha, packFile.verifyHash[entry.sha].sha, 'sha matches expected');
          t.equal(entry.offset, packFile.verifyHash[entry.sha].offset, 'offset matches expected');
        });

        t.end();
      });
    });
  },

  "packfile index: parse stream (one large chunk)" : function(t) {
    var ps = pack.createParserStream();
    repo.getPackFile(function(err, packFile) {
      t.plan(2 + packFile.verifyObjs.length * 2)
      // delay for binds, and flow of code
      process.nextTick(function() {
        ps.write(packFile.indexBuffer);
      });

      ps.on('end', function(result) {
        t.ok(result.entries, 'found entries');

        t.equal(packFile.verifyObjs.length, result.entries.length);

        result.entries.forEach(function(entry) {
          t.equal(entry.sha, packFile.verifyHash[entry.sha].sha, 'sha matches expected');
          t.equal(entry.offset, packFile.verifyHash[entry.sha].offset, 'offset matches expected');

        });

        t.end();
      });
    });
  },

  "packfile index: parse stream (fs pipe)" : function(t) {
    var ps = pack.createParserStream();
    repo.getPackFile(function(err, packFile) {
      t.plan(2 + packFile.verifyObjs.length * 2);

      fs.createReadStream(packFile.packFile.replace('.pack', '.idx')).pipe(ps);

      ps.on('end', function(result) {
        t.ok(result.entries, 'found entries');
        t.equal(packFile.verifyObjs.length, result.entries.length);

        result.entries.forEach(function(entry) {
          t.equal(entry.sha, packFile.verifyHash[entry.sha].sha, 'sha matches expected');
          t.equal(entry.offset, packFile.verifyHash[entry.sha].offset, 'offset matches expected');
        });

        t.end();
      });
    });
  },



  // "unpack: valid object count (real file)" : function(t) {
  //   t.plan(2);
  //   repo.getPackFile(function(err, packFile) {
  //     pack.unpack(packFile.buffer, function(err, obj) {

  //       // from previous observation, the packfile had 3 objects in it
  //       // ensure sanity before we assume that we actually parsed the packfile
  //       // correctly.
  //       t.ok(packFile.totalObjects > 0);

  //       t.equal(obj.count, packFile.totalObjects);
  //       t.end();
  //     }, noop);
  //   });
  // },
}
