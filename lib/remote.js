var helpers = require('../common/helpers');
var remote = module.exports = {};

remote.remotes = {};

remote.list = function() {
  return remote.remotes;
};

remote.add = function(opts) {

  this.remotes[opts.name] = {
    branch: opts.branch || 'master',
    port: opts.port || 8000,
    address: opts.address || '127.0.0.1',
    path: 'origin'
  };

  return this;
};

remote.rm = function(opts) {

  throw new Error('not implemented');
};