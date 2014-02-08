function Connection(client, transport, done) {
  this._mid = 0;
  this._transport = transport;
  this._buffer = {};
  this.remote = {};

  var self = this;
  var bindObj = this.remote;

  // Buffer all the methods
  var suppliedMethods = client._methods;
  if(suppliedMethods) {
    for(var i=0, len=suppliedMethods.length; i<len; i++) {
      var n = suppliedMethods[i];
      bindObj[n] = self._methodBuffer(n);
    }
  }

  // Call a method via the API
  function methodSend(methodName, args) {
    var done;
    var respRequired = false;

    if( typeof(args[args.length-1]) === "function" ) {
      respRequired = true;
      done = args.pop();
    }

    transport.send({
      uid: client._id,
      namespace: client._namespace,
      type: "call",
      methodName: methodName,
      respRequired: respRequired,
      mid: client._mid++,
      data: args
    }, function(data) {
      done(data.data);
    });
  }

	var hdl;
	var attemptConnection = function() {
    hdl = setTimeout(attemptConnection, 1000);

    var transportOpts = {
			uid: client._id,
			type: "methods",
			namespace: client._namespace
    };
		transport.send(transportOpts, function(resp) {
			clearInterval(hdl);

      var remoteMethods = resp.data

			if(!(remoteMethods instanceof Array)) {
				// Invalid response :(
				if(done) done("Invalid methods response");
        return;
			}

      // TODO: Needs further thought
      var hasAllMethods = true;
      for(var k in bindObj) {
        delete bindObj[k];
        if(remoteMethods.indexOf(k) < 0) {
          hasAllMethods = false;
        }
      }

      if(!hasAllMethods) {
        done("Missing methods");
        return;
      }

      // Call all the methods in the buffer
      for(var k in self._buffer) {
        self._buffer[k].forEach(function(args) {
          methodSend.call(this, k, args);
        });
      }

      // Bind remote methods
      function bindMethods(methods, hostId) {
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
			bindMethods(remoteMethods, client._id);

      // Done!
			if(done) done(false, self);
      return;
		}, 10000);
	}

  attemptConnection();
}

// Buffer method calls to wait for connection
Connection.prototype._methodBuffer = function(name) {
  var self = this;
  this._buffer[name] = [];
  return function() {
    var args = Array.prototype.splice.call(arguments, 0);
    self._buffer[name].push(args);
  };
}


Connection.create = function(client, transport, done) {
  // TODO: Done via events here
  var ret = new Connection(transport, done);
  return ret;
}

Connection.prototype.close = function() {
  this.transport.close();
  this._buffer.length = 0;
  this._transport = null;
  return this;
}

module.exports = Connection;
