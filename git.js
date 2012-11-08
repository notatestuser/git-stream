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

Git.prototype.remote = require('./lib/remote');

/*
Git.prototype.Diff = require('./lib/diff');
Git.prototype.push = require('./lib/push');
Git.prototype.pull = require('./lib/pull');

Git.prototype.add = require('./lib/add');
Git.prototype.commit = require('./lib/commit');
*/
