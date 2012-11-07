
var helpers = require('../common/helpers');

var Remote = module.exports = function(repo, name) {
  
  this.repo = repo;
  this.name = name;
  this.refs = {};

  // Add a ref to this remote. fullName is of the form:
  //   refs/heads/master or refs/tags/123

  this.addRef = function(fullName, sha) {
    
    var type, name;
    
    if (fullName.slice(0, 5) == "refs/") {
      type = fullName.split("/")[1]
      name = this.name + "/" + fullName.split("/")[2]
    }
    else {
      type = "HEAD"
      name = this.name + "/" + "HEAD"
    }

    this.refs[name] = {
      name: name, 
      sha: sha, 
      remote: this, 
      type: type
    };
  }
  
  this.getRefs = function() {
    return helpers.values(this.refs);
  };
  
  this.getRef = function(name) {
    return this.refs[this.name + "/" + name];
  };
};

Remote.add = function(name, url) {

};
