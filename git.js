//
// node-git
//
var helpers = require('helpers');

var Git = module.exports = function Git() {

};

Git.prototype.Remote = require('./lib/remote');
Git.prototype.HttpRemote = require('./lib/httpremote');

Git.prototype.BinaryFile = require('./lib/binaryfile');
Git.prototype.Pack = require('./lib/pack');
Git.prototype.Objects = require('./lib/objects');
Git.prototype.TreeDiff = require('./lib/treediff');
Git.prototype.FileDiff = require('./lib/filediff');

Git.prototype.OBJECT_TYPES = ["tag", "commit", "tree", "blob"];
Git.prototype.REMOTE_TYPE = "HttpRemote";

//  
// Print an error either to the console if in node, or to div#jsgit-errors
// if in the client.
//
Git.prototype.handleError = function(message) {

  if (jsGitInNode) {
    log(message)
  }
  else {
    $('#jsgit-errors').append(message)
  }
};
  
//
// Turn an array of bytes into a String
//
Git.prototype.bytesToString = function(bytes) {

  var result = "";
  var i;
  for (i = 0; i < bytes.length; i++) {
    result = result.concat(String.fromCharCode(bytes[i]));
  }
  return result;
};
  
//
//
//
Git.prototype.stringToBytes = function(string) {

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
Git.prototype.toBinaryString = function(binary) {
  
  if (Array.isArray(binary)) {
    return Git.bytesToString(binary)
  }
  else {
    return binary
  }
};
    
//
// returns the next pkt-line
//
Git.prototype.nextPktLine = function(data) {
  
  var length = parseInt(data.substring(0, 4), 16);
  return data.substring(4, length);
};
  
//
// zlib files contain a two byte header. (RFC 1950)
//
Git.prototype.stripZlibHeader = function(zlib) {

  return zlib.slice(2)
};
  
//
//
//
Git.prototype.escapeHTML = function(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

//
//
//
Git.prototype.applyDelta = (function() {
  
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

    var baseData = Git.stringToBytes(baseDataString)
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
        _(4).times(function() {
          if ((opcode & 0x01) != 0) {
            value = stream.data[stream.offset]
            stream.offset += 1
            copyOffset += (value << shift)
          }
          opcode >>= 1
          shift += 8
        })
        shift = 0
        _(2).times(function() {
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
        
        // TODO: check if this is a version 2 packfile and apply copyFromResult if so
        copyFromResult = (opcode & 0x01)
        resultData += Git.bytesToString(baseData.slice(copyOffset, copyOffset + copyLength))
        
      } else if ((opcode & 0x80) == 0) {
        resultData += Git.bytesToString(stream.data.slice(stream.offset, stream.offset + opcode))
        stream.offset += opcode
      }
    }
    
    if (resultLength != resultData.length) {
      throw (Error("Delta Error: got result length " + resultData.length + ", expected " + resultLength))
    }
    return resultData
  }
}());
