var objects = require('../../lib/objects'),
    repo = require('../fixtures/repo'),
    unpack = require('../../lib/unpack'),
    git = new (require('../../git'))(),
    commitParts = [
      'tree 039486ad38f1b796b5cb39b2548481016af44d8e',
      'parent 0af4f50f39cbd756d0b5c6da097ad857479c083e',
      'author Elijah Insua <tmpvar@gmail.com> 1352145386 -0700',
      'committer Elijah Insua <tmpvar@gmail.com> 1352145386 -0700',
      '',
      'add test',
      ''
    ];

module.exports = {
  "objects [commit]: creation" : function(t) {

    var commit = objects.make(null, 'commit', commitParts.join('\n'));

    t.equal(commit.tree, '039486ad38f1b796b5cb39b2548481016af44d8e');
    t.equal(commit.parents.length, 1);
    t.equal(commit.parents[0], '0af4f50f39cbd756d0b5c6da097ad857479c083e');
    t.equal(commit.author.name, 'Elijah Insua');
    t.equal(commit.author.email, 'tmpvar@gmail.com');
    t.equal(commit.author.timestamp, 1352145386);
    t.equal(commit.author.timezone, '-0700');

    t.end();
  },
  "objects [commit]: serialization" : function(t) {
    var commitString = commitParts.join('\n');
    var commit = objects.make(null, 'commit', commitString);
    t.equal(commit.toString(), commitString);

    t.end();
  },
  "objects [tree]: creation" : function(t) {
    t.plan(1)
    repo.getPackFile(function(err, packFile) {
      t.ok(!err);
      unpack(packFile.buffer, function(err, obj) {
console.log(JSON.stringify(obj , null, '  '));
      t.end();
      }, function make(sha, type, data) {
        if (type === 'tree') {
          var tree = objects.make(sha, type, data);
          return tree;
        }
        return null;
      });

    })
  }



}