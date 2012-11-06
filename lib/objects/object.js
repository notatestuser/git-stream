var Buffer = require('buffer').Buffer;

function GitObject(options) {
  if (Buffer.isBuffer(options) || typeof options === 'string') {
    this.parse(options);

  } else {
    options = options || {};
    Object.keys(options).forEach(function(key) {
      this[key] = options[key];
    }.bind(this));
  }
}

GitObject.prototype = {
  parse : function() {}
};

module.exports = GitObject;
