var guid = require("../guid");
var api = require("./api");


function Server(namespace, methods) {
  this._id = guid();
  this._namespace = namespace;
  this._methods = methods
}

Server.create = function(namespace, methods) {
  return new Server(namespace, methods);
};

Server.prototype.listen = function(transport) {
  var self = this;
  transport.on("message", function(data) {
    // Is self a message from us? If so ignore
    if(data.uid === self._id) return;

    // If self for the correct namespace?
    if(data.namespace !== self._namespace) return;

    if(api.hasOwnProperty(data.type)) {
      api[data.type].call(self, data);
    } else {
      if(console) console.error(data.type+": unsupported");
    }
  });
  this._transport = transport;
  return this;
}

Server.prototype.close = function() {
  this._transport.close();
  this._transport = null;
  return this;
}

module.exports = Server;
