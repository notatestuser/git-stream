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
            var current = verifyParts.length;
            while(current--) {
              if (verifyParts[current].match(/^[0-9a-z]{20}/)) {
                break;
              }
              verifyParts.pop();
            }
            verifyString = verifyParts.join('\n');

            var verifyHash = {};

            verifyParts.forEach(function(line) {
              var parts = line.replace(/[ ]+/g, ' ').split(' ');

              var sha = parts.shift();
              var obj = {
                sha : sha,
                type : parts.shift(),
                uncompressedSize : parseInt(parts.shift(), 10),
                compressedSize : parseInt(parts.shift(), 10),
                offset : parseInt(parts.shift(), 10)
              };
              verifyObjs.push(obj);
              verifyHash[sha] = obj;
            });


            exec('git count-objects -v', packRepoOpts, function(err, stdout) {
              if (err) throw err;

              var count = parseInt(stdout.split('\n').shift().split(' ').pop(), 10);

              glob(packRepoPath + '/.git/objects/pack/*.pack', function(err, files) {

                if (err) throw err;

                var packFile = files[0];

                fs.readFile(packFile, function(err, packFileBuffer) {
                  if (err) throw err;

                  fs.readFile(packFile.replace('.pack', '.idx'), function(err, indexBuffer) {

                    // cleanup
                    //rimraf(packRepoPath, function() {
                       fn(null, {
                         repoDirectory: packRepoPath + '.git/',
                         packFile: packFile,
                         totalObjects: count,
                         buffer: packFileBuffer,
                         indexBuffer: indexBuffer,
                         verifyString: verifyString,
                         verifyObjs: verifyObjs,
                         verifyHash: verifyHash
                       });
                    //});
                  })
                });
              });
            });
          });
        });
      });
    });
  });
}