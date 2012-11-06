
module.exports.Blob = require('./blob');
module.exports.Commit = require('./commit');
module.exports.Tag = require('./tag');
module.exports.Tree = require('./tree');

module.exports.typeToString = function(type) {
  if (type < 0) { return 'bad'; }
  return [
    'none',
    'commit',
    'tree',
    'blob',
    'tag',
    'reserved',
    'offset delta',
    'ref delta',
    'any',
    'max'
  ][type] || 'bad';
};

module.exports.stringToType = function(type) {
  return module.exports[type.toUpperCase()] || -1;
}

module.exports.BAD = -1;
module.exports.NONE = 0;
module.exports.COMMIT = 1;
module.exports.TREE = 2;
module.exports.BLOB = 3;
module.exports.TAG = 4;
module.exports.OFS_DELTA = 6;
module.exports.REF_DELTA = 7;
module.exports.ANY = null;
module.exports.MAX = null;

module.exports.createObject = function(type, options) {
  var constructor = function() {
    this.type = module.exports.BAD;
  };

  if (!isNaN(type)) {
    type = module.exports.typeToString(type);
  }

  if (type) {
    type = type[0].toUpperCase() + type.substring(1);
  }

  if (!module.exports[type]) {

  } else {
    constructor = module.exports[type];
  }

  if (constructor) {
    return new constructor(options);
  } else {
    throw("no constructor for " + type)
  }
}