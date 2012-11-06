
// Unpack a git pack file
// see: http://www.kernel.org/pub/software/scm/git/docs/technical/pack-format.txt

var Buffer = require('buffer').Buffer,
    packObject = require('./pack/object'),
    getType = require('../common/pack').getType,
    rawInflate = require('../common/rawinflate'),
    git = new (require('../git'))(),
    objects = require('./objects');

    // TODO: I really want to use this, but there is no way to get the
    //       number of bytes it consumed
    //zlib = require('zlib').createInflate();

module.exports = function unpack(buffer, fn, make) {

  make = make || objects.make;

  var obj = {
    version: null,
    count: null,
    objects : []
  },
  where = 0,
  fwd = function(amount) {
    where += amount;
    return where;
  };

  if (!Buffer.isBuffer(buffer)) {
    return fn(new Error('Unpack expects a buffer'));
  }

  if (buffer.length < 4 || buffer.slice(0, 4).toString('ascii') !== 'PACK') {
    return fn(new Error('Invalid signature'));
  }

  if (buffer.length < 8) {
    return fn(new Error('Invalid version length'));
  }

  obj.version = buffer.readUInt32BE(4);
  if (obj.version !== 2) {
    return fn(new Error('Invalid version (expected 2)'));
  }

  if (buffer.length < 12) {
    return fn(new Error('Invalid object count'));
  }

  obj.count = buffer.readUInt32BE(8);

  if (obj.count > 0 && buffer.length === 12) {
    return fn(new Error('Invalid object entry section'), obj)
  }

  var where = 12, objectIndex = 0;
  var readObject = function(buffer) {
    if (objectIndex < obj.count) {

      // Read the type
      var c = buffer.readUInt8(where);

      var type = (c >> 4) & 7;
      var length = (c & 15);
      var shift = 4;
      var offset = where;

      fwd(1);
      while (c & 0x80) {
        c = buffer.readUInt8(where);
        length += (c & 0x7f) << shift;
        shift += 7;
        fwd(1);
      }


      // TODO: collect the sha
      if (type === packObject.OBJ_OFS_DELTA || type === packObject.OBJ_REF_DELTA) {
        console.log('SHA', buffer.slice(where, where+20));
        fwd(20);
      }

      var inflated = rawInflate(git.bytesToString(buffer.slice(fwd(2))));
      // TODO: WARNING!! the compressed length returned by this function is incorrect

      fwd(inflated.compressedLength + 4);

      // TODO: sha
      obj.objects.push(make(null, packObject.typeToString(type), new Buffer(git.stringToBytes(inflated.toString()))));

      process.nextTick(function() {
        objectIndex++;
        readObject(buffer);
      });

    } else {
      fn(null, obj);
    }
  };

  readObject(buffer);
};
