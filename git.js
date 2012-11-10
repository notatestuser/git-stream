//
// node-git
//
var helpers = require('./common/helpers');
var util = require('util');
var net = require('net');
var Stream = require("stream").Stream;

var stream = new Stream();

var Git = module.exports = function Git(opts) {

  var that = this;
  var buf = [];
  var destroyed = false;

  Stream.call(this);

  that.writable = true;
  that.readable = true;

};

util.inherits(Git, Stream);

Git.prototype.createRepo = function(opts) {

  var repo = new this.Repo(opts);
  return repo;
};

Git.prototype.write = function(data) {
};

Git.prototype.read = function(data) {
};

Git.prototype.end = function(data) {
};

Git.prototype.remote = require('./lib/remote');
Git.prototype.diff = require('./lib/diff');

