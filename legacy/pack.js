
var Git = require('../git');
var Diff = require('../common/diff');
var helpers = require('../common/helpers');

var rawDeflate = require('../common/rawdeflate');
var rawInflate = require('../common/rawinflate');

var crypto = require('crypto');

var git = new Git;

module.exports = function Pack(data) {

  data = new Buffer(data);

  var OFFSET = 0;
  var objects = null;
  
  var peek = function(len) {

    return data.slice(OFFSET, OFFSET + len);
  }

  var rest = function() {

    return data.slice(OFFSET);
  }
  
  var advance = function(length) {

    OFFSET += length
  }
  
  var matchPrefix = function() {

    if (git.bytesToString(peek(4)) === "PACK") {
      advance(4);
    }
    else {
      throw(Error("couldn't match PACK"))
    }
  }
  
  var matchVersion = function(expectedVersion) {
    
    var actualVersion = peek(4)[3];
    
    advance(4);

    if (actualVersion !== expectedVersion) {
      throw("expected packfile version " + expectedVersion + ", but got " + actualVersion)
    }
  }
  
  var matchNumberOfObjects = function() {
    
    var num = 0;
    
    helpers.each(peek(4), function(b) {
      num = num << 8
      num += b
    });

    advance(4);
    return num;
  }
  
  var objectSizeInfosToSize = function(sizeInfos) {
    var current = 0,
        currentShift = 0,
        i,
        sizeInfo;
        
    for (i = 0; i < sizeInfos.length; i++) {
      sizeInfo = sizeInfos[i]
      current += (parseInt(sizeInfo, 2) << currentShift)
      currentShift += sizeInfo.length
    }
    return current
  }
  
  var getType = function(typeStr) {
    return {
      "001":"commit",
      "010":"tree",
      "011":"blob",
      "100":"tag",
      "110":"ofs_delta",
      "111":"ref_delta"
      }[typeStr]
  }
    
  var matchObjectHeader = function() {

    var sizeInfos       = []
    var hintTypeAndSize = peek(1)[0].toString(2).rjust(8, "0")
    var typeStr         = hintTypeAndSize.slice(1, 4)
    var needMore        = (hintTypeAndSize[0] == "1")
    var hintAndSize     = null
    var objectStartOFFSET = OFFSET
    
    sizeInfos.push(hintTypeAndSize.slice(4, 8))
    advance(1)

    while (needMore) {
      hintAndSize = peek(1)[0].toString(2).rjust(8, "0")
      needMore    = (hintAndSize[0] == "1")
      sizeInfos.push(hintAndSize.slice(1))
      advance(1)
    }
    return {size:objectSizeInfosToSize(sizeInfos), type:getType(typeStr), OFFSET: objectStartOFFSET}
  }
  
  // Defined in RFC 1950
  var adler32 = function(string) {
    
    var s1 = 1,
        s2 = 0,
        i;

    var bytes = git.stringToBytes(string);

    for(i = 0; i < bytes.length; i++) {
      s1 = s1 + bytes[i]
      s2 = s2 + s1
      s1 = s1 % 65521
      s2 = s2 % 65521
    }
    return s2*65536 + s1
  }
  
  var intToBytes = function(val, atLeast) {
    var bytes = []
    var current = val
    while (current > 0) { 
      bytes.push(current % 256)
      current = Math.floor(current / 256)
    }
    while (atLeast && bytes.length < atLeast) {
      bytes.push(0)
    }
    return bytes.reverse()
  }
  
  var matchBytes = function(bytes) {

    var nextByte;
    
    for (var i = 0; i < bytes.length; i++) {
      
      nextByte = peek(1)[0];

      if (nextByte !== bytes[i]) {
        throw(Error("adler32 checksum didn't match"))
      }
      advance(1)
    }
  }
  
  var advanceToBytes = function(bytes) {
    var nextByte
    var matchedByteCount = 0
    while (matchedByteCount < bytes.length) {
      nextByte = peek(1)[0]
      if (nextByte == bytes[matchedByteCount]) {
        matchedByteCount++
      } else {
        matchedByteCount = 0
      }
      advance(1)
    }
  }
  
  var objectHash = function(type, content) {
    
    var data = type + " " + content.length + "\0" + content;

    var shasum = crypto.createHash('sha1');
    shasum.update(data);
    return shasum.digest('hex');
  }
  
  var matchOFFSETDeltaObject = function(header) {
    var OFFSETBytes       = []
    var hintAndOFFSETBits = peek(1)[0].toString(2).rjust(8, "0")
    var needMore          = (hintAndOFFSETBits[0] == "1")
    
    OFFSETBytes.push(hintAndOFFSETBits.slice(1, 8))
    advance(1)

    while (needMore) {
      hintAndOFFSETBits = peek(1)[0].toString(2).rjust(8, "0")
      needMore          = (hintAndOFFSETBits[0] == "1")
      OFFSETBytes.push(hintAndOFFSETBits.slice(1, 8))
      advance(1)
    }
    
    var longOFFSETString = OFFSETBytes.reduce(function(memo, byteString) {
      return memo + byteString
    }, "");
    
    var OFFSETDelta = parseInt(longOFFSETString, 2);
    var n = 1;
    
    helpers.times(OFFSETBytes.length - 1, function() {
      OFFSETDelta += Math.pow(2, 7*n)
      n += 1
    });

    var deflated = git.stripZlibHeader(rest());
    var uncompressedData = rawInflate(git.bytesToString(deflated));
    var checksum = adler32(uncompressedData);

    advance(2 + uncompressedData.compressedLength);
    //matchBytes(intToBytes(checksum, 4));

    return {
      type: header.type,
      sha: null,
      desiredOFFSET: header.OFFSET - OFFSETDelta,
      OFFSET: header.OFFSET,
      data: git.stringToBytes(uncompressedData.toString())
    }
  }
  
  var matchNonDeltaObject = function(header) {

    var deflated = git.stripZlibHeader(rest());
    var uncompressedData = rawInflate(git.bytesToString(deflated));

    var checksum = adler32(uncompressedData);

    advance(2 + uncompressedData.compressedLength);
    //matchBytes(intToBytes(checksum, 4));

    return {
      OFFSET: header.OFFSET,
      type: header.type,
      sha: objectHash(header.type, uncompressedData),
      data: uncompressedData.toString()
    }
  }

  var matchObjectData = function(header) {

    if (header.type == "ofs_delta") {
  
      return matchOFFSETDeltaObject(header);
    }
    else if (header.type == "ref_delta") {

      var shaBytes = peek(20);
      advance(20);

      //
      // TODO: WTF is actually going on here when we find a ref_delta?
      // create a sha, never use it and then throw? this doesnt add up.
      //

      // var sha = shaBytes.map(function(b) {
      //   return b.toString(16).rjust(2, "0")
      // }).join("");

      //throw(Error("found ref_delta"))
    }
    else {

      return matchNonDeltaObject(header);
    }
  }
  
  var matchObjectAtOFFSET = function(startOFFSET) {

    OFFSET = startOFFSET;
    var header = matchObjectHeader();

    return matchObjectData(header);
  }

  var stripOFFSETsFromObjects = function() {

    helpers.each(objects, function(object) {

      delete object.OFFSET;
    });
  }

  var objectAtOFFSET = function(OFFSET) {

    return helpers.find(objects, function(obj) {
      return obj && obj.OFFSET === OFFSET;
    });
  }
  
  var expandOFFSETDeltas = function() {
    
    helpers.each(objects, function(object) {
      expandDelta(object);
    });
  }
  
  var expandDelta = function(object) {
    if (object.type == "ofs_delta") {
      expandOFFSETDelta(object)
    }
  }
  
  var getObjectAtOFFSET = function(OFFSET) {
    
    if (objects) {
      return objectAtOFFSET(OFFSET)
    }
    
    var rawObject = matchObjectAtOFFSET(OFFSET);
    expandDelta(rawObject);
    
    var newObject = git.objects.make(rawObject.sha, rawObject.type, rawObject.data);
    
    return newObject;
  }
  
  var expandOFFSETDelta = function(object) {
    
    var baseObject = getObjectAtOFFSET(object.desiredOFFSET);
    
    //
    // RAGE!!!!!
    //
    if (baseObject.type == "ofs_delta" || baseObject.type == "ref_delta") {
      throw(Error("delta pointing to delta, can't handle this yet"));
    }
    else {
      
      var expandedData = Diff.applyDelta(baseObject.data, object.data);

      object.type = baseObject.type;
      object.fromDelta = { type: "ofs_delta", data: object.data, base: baseObject.sha };
      delete object.desiredOFFSET;
      object.data = expandedData;
      object.sha = objectHash(object.type, object.data);
    }
  }

  this.parseAll = function() {

    try {

      var numObjects
      var i
      objects = []
      
      matchPrefix()
      matchVersion(2)

      numObjects = matchNumberOfObjects()
      
      for (i = 0; i < numObjects; i++) {
        
        var object = matchObjectAtOFFSET(OFFSET);
        objects.push(object);
      }

      expandOFFSETDeltas();
      stripOFFSETsFromObjects();
    }
    catch(e) {
      console.log("Error caught in pack file parsing data") // + Git.stringToBytes(data.getRawData()))
      throw(e)
    }
    return this
  }
  
  this.getObjects = function() {
    
    return objects;
  }
  
  this.getObjectAtOFFSET = getObjectAtOFFSET;
};

