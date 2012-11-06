var GitObject = require('./object'),
    util = require('util'),
    authorExtractor = /^([a-z]+) (.*) <(.*)> (\d+) ([\+-]\d+)$/;


function Commit() {
  GitObject.apply(this, arguments);
};

util.inherits(Commit, GitObject);

Commit.prototype.type = 1;

Commit.prototype.parse = function(data) {

  var lines = data.toString().split("\n");
  this.tree = lines.shift().split(" ")[1];

  this.parents = [];
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
}

module.exports = Commit;
