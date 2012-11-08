var objects = require('../../lib/objects'),
    repo = require('../fixtures/repo'),
    pack = require('../../lib/pack'),
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
  "objects: creation (invalid type)" : function(t) {
    var obj = objects.createObject('bla');

    t.equal(obj.type, objects.BAD, 'should be of type "bad" (-1)');
    t.end();
  },

  "objects [commit]: creation" : function(t) {

    var commit = objects.createObject(objects.COMMIT, commitParts.join('\n'));

    t.equal(commit.tree, '039486ad38f1b796b5cb39b2548481016af44d8e', 'tree sha matches');
    t.equal(commit.parents.length, 1, 'parent length is the same');
    t.equal(commit.parents[0], '0af4f50f39cbd756d0b5c6da097ad857479c083e', 'parent sha matches');
    t.equal(commit.author.name, 'Elijah Insua', 'author matches');
    t.equal(commit.author.email, 'tmpvar@gmail.com', 'author email matches');
    t.equal(commit.author.timestamp, 1352145386, 'timestamp matches');
    t.equal(commit.author.timezone, '-0700', 'timezone matches');

    t.end();
  },

  "objects [commit]: creation (string) type)" : function(t) {

    var commit = objects.createObject('commit');
    var commit2 = objects.createObject(objects.COMMIT);

    t.equal(commit.type, commit2.type, 'types match');
    t.end();
  },

  "objects [commit]: creation (numeric) type)" : function(t) {

    var commit = objects.createObject(objects.COMMIT);
    t.equal(commit.type, objects.COMMIT, 'types match');
    t.end();
  },

  "objects [commit]: serialization" : function(t) {
    var commitString = commitParts.join('\n');
    var commit = objects.createObject(objects.COMMIT, commitString);
    t.equal(commit.toString(), commitString, 'commit strings match');

    t.end();
  },
  "objects [tree]: creation" : function(t) {

    repo.getPackFile(function(err, packFile) {

      var plan = 1;
      packFile.verifyObjs.forEach(function(obj) {
        if (obj.type === 'tree') {
          plan+=2;
        }
      });

      t.plan(plan);
      t.ok(!err, 'no error');

      pack.unpack(packFile.buffer, function(err, obj) {
      }, function make(type, data) {

        if (type === objects.TREE) {
          var tree = objects.createObject(type, data);

          t.equal(tree.type, objects.TREE, 'it is infact a tree');
          t.ok(tree.nodes.length > 0, 'number of nodes match');

          return tree;
        }
        return null;
      });
    });
  }
};
