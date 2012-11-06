var fs = require('fs'),
    exec = require('child_process').exec,
    glob = require('glob'),
    rimraf = require('rimraf'),
    cpr = require('cpr').cpr;


var packRepoPath =  __dirname + '/tmp/repo-pack/';
var packRepoOpts = { cwd : packRepoPath };

module.exports.getPackFile = function(fn) {

  cpr(__dirname + '/repo-pack/', packRepoPath, { deleteFirst: true }, function() {

    exec('git init . && git add . && git commit -m "initial"', packRepoOpts, function() {

      fs.writeFileSync(packRepoPath + 'readme2.md', "hello world\nhello again");

      exec('git commit -am "change readme"', packRepoOpts, function(e, out) {

        var b = new Buffer(1024);
        b.fill('a');

        fs.writeFileSync(packRepoPath + 'readme2.md', "hello world");

        exec('chmod +xrw readme2.md && git add readme2.md && git commit -am "add test" && git repack', packRepoOpts, function() {
          exec('git verify-pack -v .git/objects/pack/pack-*.idx', packRepoOpts, function(e, verifyString) {

            var verifyParts = verifyString.split('\n'), verifyObjs = [];
            verifyParts.pop();
            verifyParts.pop();

            verifyParts.forEach(function(line) {
              var parts = line.split(' ');
              var obj = {
                sha : parts.shift(),
                type : parts.shift(),
                uncompressedSize : parts.shift(),
                compressedSize : parts.shift(),
                offset : parts.shift(),
              };
              verifyObjs.push(obj);
            });


            exec('git count-objects -v', packRepoOpts, function(err, stdout) {
              if (err) throw err;

              var count = parseInt(stdout.split('\n').shift().split(' ').pop(), 10);

              glob(packRepoPath + '/.git/objects/pack/*.pack', function(err, files) {

                if (err) throw err;

                var packFile = files[0];

                fs.readFile(packFile, function(err, buffer) {
                  if (err) throw err;


                  // cleanup
                  rimraf(packRepoPath, function() {
                     fn(null, {
                       totalObjects: count,
                       buffer: buffer,
                       verifyString: verifyString,
                       verifyObjs: verifyObjs
                     });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
}