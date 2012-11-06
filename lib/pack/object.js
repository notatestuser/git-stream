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


