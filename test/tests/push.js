
var test = require('tap').test
var Gitstream = require('../../git-stream')

var git = new Gitstream()

module.exports = {

  "A repo should receive a push from another repo": function(test) {

    test.plan(1)

    //
    // get a repository from the fixtures directory and
    // send it to the origin (on the same machine).
    //
    var repo = git.createRepo({ path: './fixtures/repos/a' })

    repo.remote.add({
      name: 'origin',
      branch: 'master',
      host: '127.0.0.1',
      port: '8000',
      path: '/fixtures/a/b'
    })

    repo.push('origin')

    net.createServer(function(socket) {

      var repo = git.createRepo({ path: '/fixtures/a/b' })
      var writer = fstream.Writer({ path: repo.path })

      socket
        .pipe(repo)
        .pipe(repo.checkout('master'))
        .pipe(writer)

    }).listen(8000)

  }
}
