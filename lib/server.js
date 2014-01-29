var guid = require("./guid");

function createServer(namespace, transport, funcs) {
  var hostId = guid();

  // Exposed API
  var api = { 
    // Retrieve the methods bound to the object
    methods: function(data) {
      ret = Object.getOwnPropertyNames(funcs);
      transport.send({
        uid: hostId,
        rid: data.mid,
        namespace: namespace,
        type: "methods",
        data: ret
      });
    },

    // Call a bound method
    call: function(data) {
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
    }
  };
	
  // Incomming messages
  transport.on("message", function(data) {
    // Is this a message from us? If so ignore
    if(data.uid === hostId) return;

    // If this for the correct namespace?
    if(data.namespace !== namespace) return;

    if(api.hasOwnProperty(data.type)) {
      api[data.type](data);
    } else {
      if(console) console.error(data.type+": unsupported");
    }
  });
}

module.exports = createServer;
