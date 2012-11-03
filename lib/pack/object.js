var PackObject = function(type, buffer, offset) {
  this.type = type;
  this.buffer = buffer;
  this.offset = offset;
}

PackObject.prototype.type = null;


// createPackObject
module.exports.createPackObject = function(type, buffer, offset) {
  return new PackObject(type, buffer, offset);
};

module.exports.OBJ_BAD = -1,
module.exports.OBJ_NONE = 0,
module.exports.OBJ_COMMIT = 1,
module.exports.OBJ_TREE = 2,
module.exports.OBJ_BLOB = 3,
module.exports.OBJ_TAG = 4,
module.exports.OBJ_OFS_DELTA = 6,
module.exports.OBJ_REF_DELTA = 7,
module.exports.OBJ_ANY,
module.exports.OBJ_MAX
