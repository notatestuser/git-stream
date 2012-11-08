
# As a client

```js
var gitstream = require('git-stream')

//
// An in-memory representation of the repository
// this does not include all of the files, only
// the git components such as trees and blobs.
//
// A path to where this information is kept can 
// be specified. `createRepo()` returns an instace
// of the Repo constructor which is a duplex stream.
//
var r = gitstream.createRepo()

//
// add a remote (an in memory operation) currently
// only supports the tcp transport protocol.
//
r.remote.add({
  name: 'origin',
  branch: 'master',
  host: '127.0.0.1',
  port: '8000',
  path: '/foo/bar'
})

//
// or read the config from the repo and get a
// remote from there.
//
r.readConfig({ path: './git' }, function(config) {

  var origin = config.remote.origin;

  r.pull('origin')
    .pipe(r.add(file))
    .pipe(r.commit({ m: 'first commit!' }))
    .pipe(r.push('origin'))

})

var file = fs.createReadStream('./README.md')

//
// add a file, commit it and push it to the remote
//

```

# As a server

```js
var fs = require('fs')
var net = require('net')
var gitstream = require('git-stream')

//
// create a TCP server
// 
net.createServer(function(socket) {

  //
  // when the socket connects and gets data
  //
  socket.on('data', function(data) {

    data
      .pipe(gitstream.Repo())
      .pipe(gitstream.checkout('master'))
      .on('file', onfile)
  })

}).listen(8000)

var onfile = function(filename, file) {
  if (!file.isDirectory) {
    fs.createWriteStream(filename).pipe(file);
  }
}
```
