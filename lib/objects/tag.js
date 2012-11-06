var GitObject = require('./object'),
    util = require('util');

function Tag(sha, data) {
  this.type = "tag"
  this.sha = sha
  this.data = data
};

util.inherits(Tag, GitObject);

Tag.prototype.type = 4;

module.exports = Tag;
