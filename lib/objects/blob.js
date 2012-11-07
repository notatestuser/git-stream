var util = require('util'),
    GitObject = require('./object')

function Blob() {
  GitObject.apply(this, arguments);
}

util.inherits(Blob, GitObject);

Blob.prototype.type = 3;

module.exports = Blob;
