# Parabox
**WORK IN PROGRESS: Not ready for use just yet**

Good news everyone! I written a module to communicate with the parallel univerise inside your web page (also known as an iframe).


## API
You need to set up comms on either side of the iframe

Setup a simple host.

    var server = parabox.Server.create("test4", {
      echo: function(done, msg) {
        console.log("msg", msg);
      }
    });
    server.listen(transport);

And integrate a client.

    var client = parabox.Client.create("test4");
    var conn = client.connect(transport, function(conn) {
      conn.echo();
    });

Find out connection status

    conn.state // => On of: ["connecting", "connected", "error"]

You can also setup a buffered connection, where you can start calling methods before the connection is established.

    var client = parabox.Client.create("test4", ["echo"]);
    var conn = client.connect(transport);
    conn.remote.echo();


## Adapters
It's really simple to setup add a new adapter, create a modules which the following methods

    .send(String:data);
    .destroy();

And the following event

    .on("message", function(String:data) {});

You can use any events library underneath as long as it conforms to the nodejs `EventEmitter#on`/`EventEmitter#off` spec, although <https://github.com/Gozala/events> is recommended.


## Test
To test in phantomjs **only**, run

    npm test

To test in phantomjs/chrome/firefox (if installed) run

    npm run-script test-all


## License
MIT

