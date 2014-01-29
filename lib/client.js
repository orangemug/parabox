var guid = require("./guid");

/**
 * Create a RPC client
 *
 * @param {String} namespace server namespace should be uniq for your app
 * @param {Object} transport transports method to send recieve request
 * @param {Number} [opts.connTimeout=transport.connTimeout]
 * @param {Number} [opts.reqTimeout=transport.reqTimeout]
 * @param {Number} [opts.bindObj={}] object to bind methods to
 * @param {Function} done callback
 */
function createClient(namespace, transport, opts, done) {
  opts = opts || {};

  var hostId  = guid();
  var bindObj = opts.bindTo || {};
  var buffer = {};
  var mid = 0;

  // Buffer method calls waiting or connection
  function methodBuffer(name) {
    buffer[name] = []
    return function() {
      var args = Array.prototype.splice.call(arguments, 0);
      buffer[name].push(args);
    };
  }

  var suppliedMethods = opts.methods;
  if(suppliedMethods) {
    for(var i=0, len=suppliedMethods.length; i<len; i++) {
      var n = suppliedMethods[i];
      bindObj[n] = methodBuffer(n);
    }
  }

  function methodSend(methodName, args) {
    var done;
    var respRequired = false;

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

  // Timeouts
  var connTimeout = opts.connTimeout || 10000;
  var reqTimeout  = opts.connTimeout || 3000;

	var hdl;
	var attemptConnection = function() {
		transport.send({
			uid: hostId,
			type: "methods",
			namespace: namespace
		}, function(resp) {
			clearInterval(hdl);

      var remoteMethods = resp.data

			if(!(remoteMethods instanceof Array)) {
				// Invalid response :(
				if(done) done("Invalid methods response");
        return;
			}

      // Check we have a matching set of methods
      if(suppliedMethods) {
        remoteMethods = suppliedMethods.every(function(m) {
          return suppliedMethods.filter(function(sm) {
            return (m === sm);
          })
        });
        console.log("remoteMethods", remoteMethods);
      }

      for(var k in buffer) {
        buffer[k].forEach(function(args) {
          console.log("Calling");
          methodSend.call(this, k, args);
        });
      }

      function bindMethods(methods, hostId) {
        opts = opts || {};
        var len, i;

        for(i=0, len=methods.length; i<len; i++) {
          var methodName = methods[i];
          bindObj[methodName] = function() {
            var args = Array.prototype.splice.call(arguments, 0);
            methodSend.call(this, methodName, args);
          };
        }
      }

      // Passes waaaaay to many param
			bindMethods(remoteMethods, hostId);
			if(done) done(true, bindObj);
      return;
		}, opts.connTimeout);
	}

  // Conflicting timeouts
	var hdl = setInterval(attemptConnection, 1000);

  return bindObj;
}

module.exports = createClient;
