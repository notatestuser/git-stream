
//
// data utilities
//
var helpers = require('../common/helpers');

module.exports = utils = {};

utils.applyDelta = (function() {

  var matchLength = function(stream) {

    var data = stream.data
    var offset = stream.offset
    var result = 0
    var currentShift = 0
    var _byte = 128
    var maskedByte, shiftedByte

    while ((_byte & 128) != 0) {
      _byte = data[offset]
      offset += 1
      maskedByte = _byte & 0x7f
      shiftedByte = maskedByte << currentShift
      result += shiftedByte
      currentShift += 7
    }
    stream.offset = offset
    return result
  }

  return function(baseDataString, delta) {

    var baseData = this.stringToBytes(baseDataString)
    var stream = {data: delta, offset: 0, length: delta.length}

    var baseLength = matchLength(stream)

    if (baseLength != baseData.length) {
      throw (Error("Delta Error: base length not equal to length of given base data"))
    }

    var resultLength = matchLength(stream)
    var resultData = ""

    var copyOffset
    var copyLength
    var opcode
    var copyFromResult

    while (stream.offset < stream.length) {
      opcode = stream.data[stream.offset]
      stream.offset += 1
      copyOffset = 0
      copyLength = 0
      if (opcode == 0) {
        throw(Error("Don't know what to do with a delta opcode 0"))
      } else if ((opcode & 0x80) != 0) {

        var value
        var shift = 0
        helpers.times(4, function() {
          if ((opcode & 0x01) != 0) {
            value = stream.data[stream.offset]
            stream.offset += 1
            copyOffset += (value << shift)
          }
          opcode >>= 1
          shift += 8
        })
        shift = 0
        helpers.times(2, function() {
          if ((opcode & 0x01) != 0) {
            value = stream.data[stream.offset]
            stream.offset += 1
            copyLength += (value << shift)
          }
          opcode >>= 1
          shift += 8
        })
        if (copyLength == 0) {
          copyLength = (1<<16)
        }

        //
        // TODO: check if this is a version 2 packfile and apply copyFromResult if so
        //
        copyFromResult = (opcode & 0x01);
        resultData += this.bytesToString(baseData.slice(copyOffset, copyOffset + copyLength));

      }
      else if ((opcode & 0x80) == 0) {
        resultData += this.bytesToString(stream.data.slice(stream.offset, stream.offset + opcode));
        stream.offset += opcode;
      }
    }

    if (resultLength != resultData.length) {
      throw (Error("Delta Error: got result length " + resultData.length + ", expected " + resultLength))
    }
    return resultData
  }
}());

//
// Turn an array of bytes into a String
//
utils.bytesToString = function(bytes) {

  var result = '';

  for (var i = 0; i < bytes.length; i++) {
    result += String.fromCharCode(bytes[i]);
  }
  return result;
};

//
//
//
utils.stringToBytes = function(string) {

  var bytes = [];
  var i;
  for(i = 0; i < string.length; i++) {
    bytes.push(string.charCodeAt(i) & 0xff);
  }
  return bytes;
};

//
//
//
utils.toBinaryString = function(binary) {

  if (Array.isArray(binary)) {
    return utils.bytesToString(binary)
  }
  else {
    return binary
  }
};

//
// returns the next pkt-line
//
utils.nextPktLine = function(data) {

  var length = parseInt(data.substring(0, 4), 16);
  return data.substring(4, length);
};

//
// zlib files contain a two byte header. (RFC 1950)
//
utils.stripZlibHeader = function(zlib) {

  return zlib.slice(2);
};
