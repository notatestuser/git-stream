module.exports = function(states, callback) {
  var state = Object.keys(states)[0];

  var ret = function(data) {

    var initialState = state;
    var consumed = states[state].call(ret, data);

    if (data && consumed < data.length) {
      if (initialState === state) {
        console.log('WARNING:', initialState, 'did not change state');

      // handle buffer
      } else if (data.slice) {
        ret(data.slice(consumed));
      } else if (data.substring) {
        ret(data.substring(consumed))
      } else {
        console.log('WARNING: not sure how to slice', typeof data);
      }
    }
  };

  ret.change = function(newState) {
    state = newState;
    states[newState].callCount = 0;
  };

  ret.done = function() {
    console.log('DONE CALLED')
    callback && callback.apply(this, arguments);
  }

  var cache = null;
  ret.want = function(bytes, data, fn) {
    var incomingLength = data.length;
    var cacheLength = (cache) ? cache.length : 0;
    var originalState = state;
    if (cache) {
      if (Buffer.isBuffer(data)) {
        data = Buffer.concat([cache, data], data.length + cache.length);
      } else {
        data = cache + data;
      }
      cache = null;
    }

    if (data.length >= bytes) {
      if (Buffer.isBuffer(data)) {
        fn.call(this, data.slice(0, bytes), states[state].callCount);
        states[originalState].callCount++;
        return bytes;
      } else {
        fn.call(this, data.substring(0, bytes), states[state].callCount);
        states[originalState].callCount++;
        return bytes;
      }
    } else {
      cache = data;
      return incomingLength;
    }
  };

  if (state === 'init') {
    ret();
  }

  return ret;
};