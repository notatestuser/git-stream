# As a client

```js
var gitstream = require('git-stream')

//
// An in-memory representation of the repository
// this does not include all of the files, only
// the git components such as trees and blobs.
//
var repo = gitstream.createRepo({ path: './fixtures/a/a' })

repo.remote.add({
  name: 'origin',
  branch: 'master',
  host: '127.0.0.1',
  port: '8000',
  path: '/fixtures/a/b'
})

//
// add some stuff, commit and push it to the remote
//
var file = fs.createReadStream('./README.md')
var reader = fstream.Reader({ path: repo.path })

repo.pull('origin')

  .pipe(repo.add(file))
  .pipe(repo.add(reader))

  .pipe(repo.commit ({ m: 'first commit!' }))
  .pipe(repo.push('origin'))

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
  var repo = git.createRepo({ path: '/fixtures/b' })
  var writer = fstream.Writer({ path: repo.path })

  socket
    .pipe(repo)
    .pipe(repo.checkout('master'))
    .pipe(writer)

}).listen(8000)

var onfile = function(filename, file) {
  if (!file.isDirectory) {

    file.pipe(fs.createWriteStream(filename));
  }
}
```
