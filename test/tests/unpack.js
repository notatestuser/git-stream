
var fs = require('fs');
var test = require('tap').test;
var repo = require('../fixtures/repo');
var Buffer = require('buffer').Buffer;

var unpack = require('../../lib/unpack');


module.exports = {
  "unpack: not a buffer" : function(t) {
    t.plan(2);
    unpack('not a buffer', function(err) {
      t.ok(err);
      t.ok(err.message.indexOf('expects a buffer') > 0);
      t.end();
    });
  },

  "unpack: invalid signature" : function(t) {
    t.plan(2);
    unpack(new Buffer(['']), function(err) {
      t.ok(err);
      t.ok(err.message.indexOf('signature') > 0);
      t.end();
    });
  },

  "unpack: valid signature" : function(t) {
    t.plan(1);
    unpack(new Buffer('PACK'), function(err) {
      t.ok(!err || err.message.indexOf('signature') < 0);
      t.end();
    });
  },


  "unpack: invalid version (length)" : function(t) {
    t.plan(1);

    var buffer = new Buffer(6);
    buffer.fill(0);
    buffer.write('PACK');

    unpack(buffer, function(err) {
      t.ok(err.message.indexOf('version') > 0);
      t.end();
    });
  },

  "unpack: invalid version (value)" : function(t) {
    t.plan(1);

    var buffer = new Buffer(8);
    buffer.fill(0);
    buffer.write('PACK');
    buffer.writeUInt8(6, 7);

    unpack(new Buffer('PACK'), function(err) {
      t.ok(err.message.indexOf('version') > 0);
      t.end();
    });
  },

  "unpack: valid version" : function(t) {
    t.plan(1);

    var buffer = new Buffer(8);
    buffer.fill(0);
    buffer.write('PACK');
    buffer.writeUInt8(2, 7);

    unpack(buffer, function(err, obj) {
      t.ok(!err || err.message.indexOf('version') < 0);
      t.end();
    });
  },

  "unpack: invalid object count (buffer length)" : function(t) {
    t.plan(1);

    var buffer = new Buffer(8);
    buffer.fill(0);
    buffer.write('PACK');
    buffer.writeUInt8(2, 7);

    unpack(buffer, function(err) {
      t.ok(err.message.indexOf('object count') > 0);
      t.end();
    });
  },

  "unpack: valid object count" : function(t) {
    t.plan(2);

    var buffer = new Buffer(12);
    buffer.fill(0);
    buffer.write('PACK');
    buffer.writeUInt8(2, 7);
    buffer.writeUInt32BE(150, 8);

    unpack(buffer, function(err, obj) {
      t.ok(!err || err.message.indexOf('object count') < 0);
      t.equals(obj.count, 150);
      t.end();
    });
  },

  "unpack: valid object count (real file)" : function(t) {
    t.plan(2);
    repo.getPackFile(function(err, packFile) {
      unpack(packFile.buffer, function(err, obj) {

        // from previous observation, the packfile had 3 objects in it
        // ensure sanity before we assume that we actually parsed the packfile
        // correctly.
        t.ok(packFile.totalObjects > 0);

        t.equal(obj.count, packFile.totalObjects);
        t.end();
      });
    });
  },

  "unpack: invalid object entries (length)" : function(t) {
    t.plan(1);

    var buffer = new Buffer(12);
    buffer.fill(0);
    buffer.write('PACK');
    buffer.writeUInt8(2, 7);
    buffer.writeUInt32BE(150, 8);

    unpack(buffer, function(err, obj) {
      t.ok(err.message.indexOf('object entry') > 0);
      t.end();
    });
  },


  "unpack: valid object entries (real file)" : function(t) {

    repo.getPackFile(function(err, packFile) {
      unpack(packFile.buffer, function(err, obj) {
        t.plan(2+obj.objects.length*3);
        // ensure sanity before we assume that we actually parsed the packfile correctly.
        t.ok(packFile.totalObjects > 0);
        t.equal(obj.objects.length, packFile.totalObjects);

        var types = ['commit', 'commit', 'tree', 'blob', 'tree', 'blob'];

        obj.objects.forEach(function(obj, i) {
          t.ok(obj.buffer);
          t.equals(obj.type, types[i]);
          t.ok(obj.offset);
        });

        t.end()
      });
    });
  },


  /*


  "unpack: supports random access by offset": function(test) {
    repo.getPackFile(function(err, obj) {
      var pack = new git.Pack(obj.buffer);
      pack.parseAll();
console.log("AFTER PARSEALL")
      //var offsets = pack.getObjectOffsets();

      // test commit
//      var obj = pack.getObjectAtOFFSET(offsets.shift);
//console.log('getObjectAtOFFSET', obj);
      // test tag

      // test tree

//      console.log();
    });
    //

    // test.deepEqual(
    //   packFile.getObjectAtOffset(10229).id(),
    //   { type: 'tree'
    //   , sha: 'd3e1f6c063d0e579ce8b7f85324996c57b87fdcf'
    //   , data: '40000 lib\u0000\u00ef\u00c8\u00e2\u0019]9\u00f6\u00f4W\u00ee\u0003\u00bcQ\u0096\u0096\u001e6\u00f7\u00b56100644 spec_helper.rb\u0000\u009e,R\u0098\u00f2\u00c0\u00c3T\u00baX,\u0099\u00017\u00ab\u009f\u00f4\u0002l\u00f5'
    //   , contents:
    //      [ { mode: '040000'
    //        , name: 'lib'
    //        , type: 'tree'
    //        , sha: 'efc8e2195d39f6f457ee03bc5196961e36f7b536'
    //        }
    //      , { mode: '100644'
    //        , name: 'spec_helper.rb'
    //        , type: 'blob'
    //        , sha: '9e2c5298f2c0c354ba582c990137ab9ff4026cf5'
    //        }
    //      ]
    //   }
    // );
  },
/ *
  "supports random access of delta objects by offset": function(test) {

    var packFile = git.Pack(fixturePackFile);
    var object = packFile.getObjectAtOffset(11633);
    test.equals(object.type, "blob");
    test.equals(object.sha, "88a9ba3a43861008a937d585583fa21ad0e8066f");
    test.equals(object.data.slice(0, 8), "require ");
  }
*/
}
