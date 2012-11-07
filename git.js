//
// node-git
//
var helpers = require('./common/helpers');
var util = require('util');
var Stream = require("stream").Stream;

var stream = new Stream();

var Git = module.exports = function Git(opts) {

  var that = this;
  var buf = [];
  var destroyed = false;

  if (!(this instanceof Git)) {
    return new Git(opts);
  }

  Stream.call(this);

  that.writable = true;
  that.readable = true;

};

util.inherits(Git, Stream);

Git.prototype.write = function(data) {
};

Git.prototype.read = function(data) {
};

Git.prototype.end = function(data) {
};

Git.prototype.objects = require('./lib/objects');

Git.prototype.Remote = require('./lib/remote');
Git.prototype.HttpRemote = require('./lib/httpremote');

Git.prototype.Pack = require('./lib/pack');
Git.prototype.FileDiff = require('./lib/filediff');

Git.prototype.OBJECT_TYPES = ["tag", "commit", "tree", "blob"];
Git.prototype.REMOTE_TYPE = "HttpRemote";

var errors = [];
  
//
// Turn an array of bytes into a String
//
Git.prototype.bytesToString = function(bytes) {

  var result = '';

  for (var i = 0; i < bytes.length; i++) {
    result += String.fromCharCode(bytes[i]);
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
    return this.bytesToString(binary)
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

  return zlib.slice(2);
};
