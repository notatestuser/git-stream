
var helpers = require('../common/helpers');

var Remote = module.exports = function(repo, name, repoUrl) {
  
  this.repo = repo;
  this.name = name;
  this.refs = {};
  this.url = repoUrl.replace(/\?.*/, "").replace(/\/$/, "");
  this.urlOptions = Git.Remote.queryParams(repoUrl);

  this.makeUri = function(path, extraOptions) {

    var uri = this.url + path;
    var options = helpers.extend(this.urlOptions, extraOptions || {});

    if (options && Object.keys(options).length > 0) {

      var optionKeys = Object.keys(options);
      var optionPairs = optionKeys.map(function(optionName) {
        return optionName + "=" + encodeURI(options[optionName]);
      });

      return uri + "?" + optionPairs.join("&");
    }
    else {
      return uri;
    }
  };

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

Remote.prototype.queryParams = function(uri) {

  var paramString = uri.split("?")[1];

  if (!paramString) {
    return {};
  }
  
  var paramStrings = paramString.split("&");
  var params = {};

  helpers.each(paramStrings, function(paramString) {
    
    var pair = paramString.split("=");
    params[pair[0]] = decodeURI(pair[1]);
  });

  return params;
};
