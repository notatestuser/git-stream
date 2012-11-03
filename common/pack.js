module.exports.getType = function(typeStr) {
  return {
    "001":"commit",
    "010":"tree",
    "011":"blob",
    "100":"tag",
    "110":"ofs_delta",
    "111":"ref_delta"
    }[typeStr]
}