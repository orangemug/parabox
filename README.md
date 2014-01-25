# Parabox
Good news everyone! I written a module to communicate with the parallel univerise inside your web page (also known as an iframe)


## API
You need to set up comms on either side of the iframe

Setup an adapter this can be a simple an iframe postmessage

    var Proxy = function(data) {
      document.querySelector("iframe").postMessage(data, "*");
    }

Setup a simple host.

    parabox.setupHost(Proxy, {
      test: function(done) {
        done("Test");
      }
    }, opts);

Where opts can be:

 * connTimeout: Timeout of the connection
 * reqTimeout: Timeout of the a request

And intergrate a client.

    var interface = parabox.client(Proxy);

Or mix in to an existing object

    var hostObject = {};
    parabox.client(Proxy, hostObject);


## Whats going on?
On init it'll wait for `connTimeout` trying to make a connection. Any requests will get buffered until conntection is ready

Connections will keep trying to send

    {type: "init"}

It'll respond with the following method definitions

    {
      type: "methods",
      data: [
        "test"
      ]
    }

At which point the client will bind dummy methods for these.


## Todo

 * Get browserify working
 * Get example working
 * Write tests


