
# As a client

```js
var gitstream = require('git-stream')

var repo = gitstream.Repo()

//
// get a repo from disk
//
repo
  .read('./repoA')
  .on('end', function() {

  })

//
// add an origin
//

repo.remote.add({
  name: 'origin', 
  port: 8000, 
  address: '127.0.0.1', 
  id: 'username/origin'
});

repo.remote.add({
  name: 'fork', 
  port: 8000, 
  address: '127.0.0.1', 
  id: 'username/fork'
});

repo.pull('origin')

repo
  .pull('fork')
  .on('conflict', function(conflicts) {
    console.dir(conflicts);
    process.exit(0);
  })

//
// add some stuff to it
//
repo.add(fs.createReadStream('./README.md'))

//
// commit some stuff and push
//
repo.commit({ m: 'first commit!' }).push('origin')
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
      .on('end', function(repo) {
        repo.checkout('master', function() {
          repo.on('file', onfile)
        })
      })
  })

}).listen(8000)

var onfile = function(filename, file) {
  if (!file.isDirectory) {
    fs.createWriteStream(filename).pipe(file);
  }
}
```
