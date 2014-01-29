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

			if(!(resp.data instanceof Array)) {
				// Invalid response :(
				return done("Invalid methods response");
			}

      function bindMethods(methods, hostId) {
        opts = opts || {};
        var len, i;
        var mid = 0;

        for(i=0, len=methods.length; i<len; i++) {
          var methodName = methods[i];
          bindObj[methodName] = function() {
            var done;
            var respRequired = false;
            var args = Array.prototype.splice.call(arguments, 0);

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
          };
        }
      }

      // Passes waaaaay to many param
			bindMethods(resp.data, hostId);
			return done(true, bindObj);
		}, opts.connTimeout);
	}

  // Conflicting timeouts
	var hdl = setInterval(attemptConnection, 1000);
}

module.exports = createClient;
