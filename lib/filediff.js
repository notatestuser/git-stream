
var helpers = require('../common/helpers');
var Diff = require('../common/diff');

console.log(Diff)

module.exports = function FileDiff(file1, file2, options) {

  if (!(this instanceof FileDiff)) {
    return new FileDiff(file1, file2, options);
  }

  this.lines1 = file1.split("\n");
  this.lines2 = file2.split("\n");
  this.diffChunks = Diff.createPatch(this.lines1, this.lines2);

  var MAX_LINE_CHARS = 140;
  var options = options || {};
  this.contextLength = options.context || 3;
  
  this.toInfo = function() {

    if (file1 === "") {
      
      var infoChunk = { offset: 1, lines:[] };

      helpers.each(this.lines2, function(line, i) {
        infoChunk.lines.push({
          oldIndex: null, 
          newIndex: (i + 1), 
          line: line, 
          type:"added"
        });
      });

      return [infoChunk];
    }
    if (file2 === "") {
      
      var infoChunk = { offset: 1, lines:[] };
      
      helpers.each(this.lines1, function(line, i) {
        infoChunk.lines.push({
          oldIndex: (i + 1), 
          newIndex: null, 
          line: line, 
          type:"removed"
        });
      });

      return [infoChunk];
    }

    var infos = [];
    var diff = this;
    var totalAdded = 0;
    var totalRemoved = 0;
    var lastInfoChunk = null;
    var infoChunk = null;

    helpers.each(this.diffChunks, function(chunk) {

      var removed = chunk.file1;
      var added   = chunk.file2;
      
      infoChunk = null;

      var removeContext = null;
      var overlapLength = null;
      var lastLineNewIndex = null;

      if (lastInfoChunk) {

        var lastLine = lastInfoChunk.lines[lastInfoChunk.lines.length - 1];
        
        if (lastLine.oldIndex >= Math.max(removed.offset - diff.contextLength, 0)) {

          infoChunk = lastInfoChunk;
          overlapLength = lastLine.oldIndex - Math.max(removed.offset - diff.contextLength, 0);
          removeContext = Math.min(overlapLength, diff.contextLength);
          lastInfoChunk.lines = lastInfoChunk.lines.slice(0, lastInfoChunk.lines.length - removeContext);
          lastLineNewIndex = lastInfoChunk.lines[lastInfoChunk.lines.length - 1].newIndex;
        }
      }
      
      infoChunk = infoChunk || { offset: added.offset + 1, lines:[] };

      var preContextRange = [Math.max(removed.offset - diff.contextLength, 0), Math.max(removed.offset, 0)]
      var preContext = diff.lines1.slice(preContextRange[0], preContextRange[1])
      
      helpers.each(preContext, function(line, i) {
        var oldIx = preContextRange[0] + i + 1
        var newIx = oldIx + totalAdded - totalRemoved
        if (newIx > lastLineNewIndex) {
          infoChunk.lines.push({oldIndex: oldIx, newIndex:newIx, line: line, type:"context"})
        }
      })
      
      if (removed.length > 0) {
        helpers.each(removed.chunk, function(line, i) {
          var oldIx = removed.offset + i + 1
          infoChunk.lines.push({oldIndex: oldIx, newIndex:null, line: line, type:"removed"})
        })
      }
      
      if (added.length > 0) {
        helpers.each(added.chunk, function(line, i) {
          var newIx = added.offset + i + 1
          infoChunk.lines.push({oldIndex: null, newIndex:newIx, line: line, type:"added"})
        })
      }
      
      var postContextRange = [(added.offset - totalAdded + totalRemoved) + removed.length, (added.offset - totalAdded + totalRemoved) + diff.contextLength + removed.length]
      var postContext = diff.lines1.slice(postContextRange[0], postContextRange[1])
      
      helpers.each(postContext, function(line, i) {

        var oldIx = postContextRange[0] + i + 1
        var newIx = oldIx + added.length - removed.length + totalAdded - totalRemoved
        infoChunk.lines.push({oldIndex: oldIx, newIndex:newIx, line: line, type:"context"})
      });

      totalAdded += added.length;
      totalRemoved += removed.length;

      if (infoChunk !== lastInfoChunk) {

        infos.push(infoChunk);
      }

      lastInfoChunk = infoChunk;
    })
    return infos;
  };
  
  this.info = this.toInfo();

  this.toString = function() {
    return JSON.stringify(this.info);
  };
  
  this.stat = function() {
    
    var result = {insertions: 0, deletions: 0}
    
    helpers.each(this.info, function(chunk) {
      helpers.each(chunk.lines, function(line) {
        if (line.type == "context") {
          // do nothing.
        } 
        else if (line.type == "added") {
          result.insertions += 1;
        } 
        else if (line.type == "removed") {
          result.deletions += 1;
        }
      });
    });
    return result;
  };
};
