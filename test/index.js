
//
// test harness...
//
var fs = require('fs');
var path = require('path');
var tap = require('tap').test;

var pathname = './test/tests';

var filter = process.argv[2] || null

fs.readdirSync(pathname).forEach(function (name) {

  if (filter && name.indexOf(filter) < 0) { return; }

  if (path.extname(name) === '.js') {

    var basename = path.basename(name, '.js');
    var rawfile = path.join(process.cwd(), pathname, basename);

    var tests = require(rawfile);

    for (var test in tests) {
    	tap(test, tests[test]);
   }
  }
});



