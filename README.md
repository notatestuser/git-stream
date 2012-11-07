
# As a client

```js
var gitstream = require('git-stream')

var r = gitstream.Repo()

//
// get a repo from disk
//
// r.read('./repoA').pipe(r.push('origin', 'master'))

//
// add a remote
//

r.remote.add({
  name: 'origin',
  branch: 'master',
  port: 8000,
  address: '127.0.0.1',
  id: 'username/origin'
})

var file = fs.createReadStream('./README.md')

//
// add a file, commit it and push it to the remote
//
r.pull('origin')
  .pipe(r.add(file))
  .pipe(r.commit({ m: 'first commit!' }))
  .pipe(r.push('origin'))

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
