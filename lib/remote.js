var helpers = require('../common/helpers');

var remote = module.exports = {};

remote.remotes = {};

//
// list oll of the remots for this repo
//
remote.list = function() {
  return remote.remotes;
};

//
// from git usage
// git remote add [-t <branch>] [-m <master>] [-f] [--mirror=<fetch|push>] <name> <url>
//
remote.add = function(opts) {

  //
  // currently, because TCP is the only transport supported for
  // pack files, a path must be specified to identify the repo.
  //
  if (!opts.path) {
    throw new Error('Protocol requires a path to identify repo');
  }

  remote.remotes[opts.name] = {
    track: opts.t || opts.track,
    master: opts.m || opts.master,
    fetch: opts.f || opts.fetch,
    mirror: opts.mirror,
    port: opts.port || 8000,
    address: opts.address || '127.0.0.1',
    path: opts.path
  };

  return remote;
};

remote.rm = function(opts) {

  throw new Error('not implemented');
};
