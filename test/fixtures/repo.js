var fs = require('fs'),
    exec = require('child_process').exec,
    glob = require('glob'),
    rimraf = require('rimraf'),
    cpr = require('cpr').cpr;


var packRepoPath =  __dirname + '/tmp/repo-pack/';
var packRepoOpts = { cwd : packRepoPath };

module.exports.getPackFile = function(fn) {

  cpr(__dirname + '/repo-pack/', packRepoPath, { deleteFirst: true }, function() {

    exec('git init . && git add . && git commit -m "add readme"', packRepoOpts, function() {


      fs.writeFileSync(packRepoPath + 'readme.md', "hello again");

      exec('git commit -am "change readme" && git repack && git verify-pack -v .git/objects/pack/pack-*.idx', packRepoOpts, function(e, out) {
console.log(out);
        exec('git count-objects -v', packRepoOpts, function(err, stdout) {
          if (err) throw err;

          var count = parseInt(stdout.split('\n').shift().split(' ').pop(), 10);

          glob(packRepoPath + '/.git/objects/pack/*.pack', function(err, files) {
            if (err) throw err;

            var packFile = files[0];

            fs.readFile(packFile, function(err, buffer) {
              if (err) throw err;

              // cleanup
              //rimraf(packRepoPath, function() {
                 fn(null, {
                   totalObjects: count,
                   buffer: buffer
                 });
              //});
            });
          });
        });
      });
    });
  });
}