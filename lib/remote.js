
var helpers = require('../common/helpers');

var Remote = module.exports = function Remote(repo) {

  if (!(this instanceof Remote)) {
    return new Remote(opts);
  }

  this.repo = repo;
  this.remotes = {};
};

//
// converts the object literal into the git ini 
// structure and attempts to write the remote to
// the in memory representation of the file.
//
Remote.prototype.add = function(opts) {

  var name = opts.name || 'origin';
  var branch = opts.branch || 'master';
  var host = opts.host || {
    port: 8000,
    address: '127.0.0.1',
    id: 'origin'
  };


};

Remote.prototype.rm = function(opts) {

  throw new Error('not implemented');
};
