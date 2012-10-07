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

module.exports = {

  times: function(n, iterator, context) {
    for (var i = 0; i < n; i++) iterator.call(context, i);
  }
};