
String.prototype.repeat = function( num ) {
  for( var i = 0, buf = ""; i < num; i++ ) buf += this;
  return buf;
};

String.prototype.ljust = function( width, padding ) {
  padding = padding || " ";
  padding = padding.substr( 0, 1 );
  if( this.length < width )
    return this + padding.repeat( width - this.length );
  else
    return this.toString();
};

String.prototype.rjust = function( width, padding ) {
  padding = padding || " ";
  padding = padding.substr( 0, 1 );
  if( this.length < width )
    return padding.repeat( width - this.length ) + this;
  else
    return this.toString();
};

var forEach = Array.prototype.forEach;
var breaker = {};

var methods = {

  times: function(n, iterator, context) {
    for (var i = 0; i < n; i++) iterator.call(context, i);
  },

  values: function(obj) {
    var a = [];
    for(var key in obj) { 
      a.push(obj[key]); 
    }
    return a;
  },

  extend: function(obj) {

    methods.each(slice.call(arguments, 1), function(source) {

      for (var prop in source) {
        obj[prop] = source[prop];
      }
    });
    return obj;
  },
  
  each: function(obj, iterator, context) {

    if (obj == null) { return; }
    
    if (forEach && obj.forEach === forEach) {

      obj.forEach(iterator, context);
    } 
    else if (obj.length === +obj.length) {

      for (var i = 0, l = obj.length; i < l; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) { return; }
      }
    } else {
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) { return; }
        }
      }
    }
  };
};

module.exports = methods;
