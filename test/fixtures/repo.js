var fs = require('fs'),
    exec = require('child_process').exec,
    glob = require('glob'),
    rimraf = require('rimraf');

var packFile = __dirname + '/repo/.git/objects/pack/pack-82308c01d9ad8886e8c0003ddf5a83de8a60815f.pack';
var packRepoPath =  __dirname + '/repo-pack/';
var packRepoOpts = { cwd : packRepoPath };

module.exports.getPackFile = function(fn) {

  exec('git init . && git add . && git commit -m "add readme" && git repack', packRepoOpts, function() {
    exec('git count-objects -v', packRepoOpts, function(err, stdout) {
      if (err) throw err;

      var count = parseInt(stdout.split('\n').shift().split(' ').pop(), 10);

      glob(packRepoPath + '/.git/objects/pack/*.pack', function(err, files) {
        if (err) throw err;

        var packFile = files[0];

        fs.readFile(packFile, function(err, buffer) {
          if (err) throw err;

          rimraf(packRepoPath + '/.git', function() {
             fn(null, {
               totalObjects: count,
               buffer: buffer
             });
          });
        });
      });
    });
  });
}