var GitObject = require('./object'),
    util = require('util');

function Tree(options) {
  GitObject.apply(this, arguments);
};

util.inherits(Tree, GitObject);

Tree.prototype.type = 2;

Tree.prototype.parse = function(data) {
  var where = 0;
  var fwd = function(count) {
    where+=count;
    return where;
  };

  var nodes = [];
  for (where; where<data.length-1;) {

    var node = {
      type: data.slice(where, fwd(3)).toString(),
      mode: data.slice(where, fwd(3)).toString(),
      filename: "",
      sha: ""
    }

    // collect the filename
    // note: we automatically skip the space between the mode
    //       and filename
    while(data[where] !== 0) {
      var c = data[fwd(1)];
      if (c !== 0) {
        node.filename+=String.fromCharCode(c);
      }
    }

    // jump past 0x00
    fwd(1);

    node.sha = data.slice(where, fwd(20)).toString('hex');
    nodes.push(node);
  }
  this.nodes = nodes;
}

module.exports = Tree;

