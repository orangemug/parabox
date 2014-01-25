var guid = require("./guid");

function createClient(namespace, transport, opts, done) {
  var mid = 0;
  opts = opts || {};

  var hostId = guid();
  var obj    = opts.obj || {};

  // Timeouts
  var connTimeout = opts.connTimeout || 10000;
  var reqTimeout  = opts.connTimeout || 3000;

  // Bind method calls to the local object
  function bindMethods(methods) {
    for(var i=0; i<methods.length; i++) {
      var methodName = methods[i];

      obj[methodName] = function(a,b) {
        var done, args;
        var respRequired = false;
        args = Array.prototype.splice.call(arguments, 0);

        if( typeof(args[args.length-1]) === "function" ) {
          respRequired = true;
          done = args.pop();
        }

        transport.send({
          uid: hostId,
          namespace: namespace,
          type: "call",
          methodName: methodName,
          respRequired: respRequired,
          mid: mid++,
          data: args
        }, function(data) {
          done(data.data);
        });
      }
    }
  }

  // TODO: Need to add a uid here so we can retrieve the response.
  // Maybe this should go into the post message transport. Hmmm.....
	var hdl;
	var attemptConnection = function() {
		transport.send({
			uid: hostId,
			type: "methods",
			namespace: namespace
		}, function(resp) {
			clearInterval(hdl);

			if(!(resp.data instanceof Array)) {
				// Invalid response :(
				return done("Invalid methods response");
			}

			bindMethods(resp.data);
			return done(true, obj);
		}, opts.connTimeout);
	}

	var hdl = setInterval(attemptConnection, 1000);
}



function createServer(namespace, transport, funcs) {
  var hostId = guid();
  // TODO: Clone for safety
	
  transport.on("message", function(data) {
    // Is this a message from us? If so ignore
    if(data.uid === hostId) return;
    if(data.namespace !== namespace) return;

    switch(data.type) {
      // Retrieve the methods bound to the object
      case "methods":
        ret = Object.getOwnPropertyNames(funcs);
        transport.send({
          uid: hostId,
          rid: data.mid,
          namespace: namespace,
          type: "methods",
          data: ret
        });
        break;
      // Call a bound method
      case "call":
        var ret = funcs[data.methodName].apply(this, data.data);
        if(data.respRequired) {
          transport.send({
            uid: hostId,
            to: data.senderUid,
            namespace: namespace,
            type: "call",
            rid: data.mid,
            data: ret
          });
        }
        break;
      default:
        if(console) console.error(data.type+": unsupported");
    }
  });
}


module.exports = {
  createClient: createClient,
  createServer: createServer,
  postmessage: require("./transport/postmessage")
};

