
var fs = require('fs');
var test = require('tap').test;
var repo = require('../fixtures/repo');
var Buffer = require('buffer').Buffer;
var objects = require('../../lib/objects')

var pack = require('../../lib/pack');
var noop = function() { return null };

module.exports = {
  "unpack: not a buffer" : function(t) {
    t.plan(2);
    pack.unpack('not a buffer', function(err) {
      t.ok(err, 'expected error');
      t.ok(err.message.indexOf('expects a buffer') > 0, 'found expected buffer error');
      t.end();
    }, noop);
  },

  "unpack: invalid signature" : function(t) {
    t.plan(2);
    pack.unpack(new Buffer(['']), function(err) {
      t.ok(err, 'expected error');
      t.ok(err.message.indexOf('signature') > 0, 'found expected signature error');
      t.end();
    }, noop);
  },

  "unpack: valid signature" : function(t) {
    t.plan(1);
    pack.unpack(new Buffer('PACK'), function(err) {
      t.ok(!err || err.message.indexOf('signature') < 0, 'no signature error');
      t.end();
    }, noop);
  },


  "unpack: invalid version (length)" : function(t) {
    t.plan(1);

    var buffer = new Buffer(6);
    buffer.fill(0);
    buffer.write('PACK');

    pack.unpack(buffer, function(err) {
      t.ok(err.message.indexOf('version') > 0, 'found expected version error');
      t.end();
    }, noop);
  },

  "unpack: invalid version (value)" : function(t) {
    t.plan(1);

    var buffer = new Buffer(8);
    buffer.fill(0);
    buffer.write('PACK');
    buffer.writeUInt8(6, 7);

    pack.unpack(new Buffer('PACK'), function(err) {
      t.ok(err.message.indexOf('version') > 0, 'found expected version error');
      t.end();
    }, noop);
  },

  "unpack: valid version" : function(t) {
    t.plan(1);

    var buffer = new Buffer(8);
    buffer.fill(0);
    buffer.write('PACK');
    buffer.writeUInt8(2, 7);

    pack.unpack(buffer, function(err, obj) {
      t.ok(!err || err.message.indexOf('version') < 0, 'no error');
      t.end();
    }, noop);
  },

  "unpack: invalid object count (buffer length)" : function(t) {
    t.plan(1);

    var buffer = new Buffer(8);
    buffer.fill(0);
    buffer.write('PACK');
    buffer.writeUInt8(2, 7);

    pack.unpack(buffer, function(err) {
      t.ok(err.message.indexOf('object count') > 0, 'found expected object count error');
      t.end();
    }, noop);
  },

  "unpack: valid object count" : function(t) {
    t.plan(2);

    var buffer = new Buffer(12);
    buffer.fill(0);
    buffer.write('PACK');
    buffer.writeUInt8(2, 7);
    buffer.writeUInt32BE(150, 8);

    pack.unpack(buffer, function(err, obj) {
      t.ok(!err || err.message.indexOf('object count') < 0, 'no error');
      t.equals(obj.count, 150);
      t.end();
    }, noop);
  },

  "unpack: valid object count (real file)" : function(t) {
    t.plan(2);
    repo.getPackFile(function(err, packFile) {
      pack.unpack(packFile.buffer, function(err, obj) {

        // from previous observation, the packfile had 3 objects in it
        // ensure sanity before we assume that we actually parsed the packfile
        // correctly.
        t.ok(packFile.totalObjects > 0, 'there are more than 0 objects');

        t.equal(obj.count, packFile.totalObjects, 'the count is equal');
        t.end();
      }, noop);
    });
  },

  "unpack: invalid object entries (length)" : function(t) {
    t.plan(1);

    var buffer = new Buffer(12);
    buffer.fill(0);
    buffer.write('PACK');
    buffer.writeUInt8(2, 7);
    buffer.writeUInt32BE(150, 8);

    pack.unpack(buffer, function(err, obj) {
      t.ok(err.message.indexOf('object entry') > 0, 'found expected object entry error');
      t.end();
    }, noop);
  },


  "unpack: valid object entries (real file)" : function(t) {

    repo.getPackFile(function(err, packFile) {
      pack.unpack(packFile.buffer, function(err, obj) {
        t.plan(2+obj.objects.length);
        // ensure sanity before we assume that we actually parsed the packfile correctly.
        t.ok(packFile.totalObjects > 0, 'the packfie has more than 0 objects');
        t.equal(obj.objects.length, packFile.totalObjects, 'the number objects in the buffer match the number of objects in the packfile');

        obj.objects.forEach(function(obj) {
          var verifyObj = packFile.verifyObjs.shift();
          t.equals(obj.type, objects.stringToType(verifyObj.type), 'object types match');
        });

        t.end();
      });
    });
  },

  "unpack: injection of make for testing object creation" : function(t) {
    repo.getPackFile(function(err, packFile) {
      // subtract 3 which includes summary, status, newline
      t.plan((packFile.verifyString.split('\n').length - 3)*3);
      pack.unpack(
        packFile.buffer,
        function(err, obj) {},
        function make(type, data) {
          t.ok(type, 'type is ok');
          t.ok(data, 'data is ok');
          t.ok(Buffer.isBuffer(data), 'data is a buffer');
        }
      );
    });
  }


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
