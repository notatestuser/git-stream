
var objects = module.exports;
var git = new (require('../git'))();
var authorExtractor = /^([a-z]+) (.*) <(.*)> (\d+) ([\+-]\d+)$/;

objects.make = function(sha, type, content) {
  var CONSTRUCTOR_NAMES = {
    "blob": "Blob",
    "tree": "Tree",
    "commit": "Commit", "comm": "Commit",
    "tag": "Tag", "tag ": "Tag"
  };

  var constructor = objects[CONSTRUCTOR_NAMES[type]];

  if (constructor) {
    return new constructor(sha, content)
  } else {
    throw("no constructor for " + type)
  }
};

objects.Blob = function(sha, data) {
  this.type = "blob"
  this.sha = sha

  this.toString = function() {
    return data
  }
};

objects.Tree = function(sha, data) {
  this.type = "tree"
  this.sha = sha

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
};

objects.Commit = function(sha, data) {

  this.type = "commit"
  this.sha = sha

  var lines = data.toString().split("\n")
  this.tree = lines.shift().split(" ")[1]

  this.parents = []
  while (lines[0].slice(0, 6) === "parent") {
    var line = lines.shift();
    this.parents.push(line.split(" ")[1])
  }

  var parseContributor = function() {
    var matches = lines.shift().match(authorExtractor);
    this[matches[1]] = {
      name: matches[2],
      email: matches[3],
      timestamp: parseInt(matches[4], 10),
      date: new Date(parseInt(matches[4], 10) * 1000),
      timezone: matches[5]
    };
  }.bind(this);

  // author
  parseContributor();

  // committer
  parseContributor();

  if (lines[0].split(" ")[0] == "encoding") {
    this.encoding = lines.shift().split(" ")[1];
  }

  // remove padding lines
  lines.shift();
  lines.pop();

  this.message = lines.join('\n').replace(/^[ \n]*|[ \n]*$/, '');

  this.toString = function() {
    var serializeContributor = function(name) {
      var contrib = this[name];
      return [
        contrib.name,
        '<' + contrib.email + '>',
        contrib.timestamp,
        contrib.timezone
      ].join(' ');
    }.bind(this);

    return [
      'tree ' + this.tree,
      'parent ' + this.parents.join(' '),
      'author ' + serializeContributor('author'),
      'committer ' + serializeContributor('committer'),
      '',
      this.message,
      ''
    ].join('\n')
  }
};

objects.Tag = function(sha, data) {
  this.type = "tag"
  this.sha = sha
  this.data = data
};
