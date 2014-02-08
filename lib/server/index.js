var guid = require("../guid");
var api = require("./api");


function Server(namespace, methods) {
  var self = this;
  this._id = guid();
  this._namespace = namespace;
  this._methods = methods;

  // Because we can't garuentee Function#bind
  this._onMessageBind = function() {
    self._onMessage.apply(self, arguments);
  }
}

Server.create = function(namespace, methods) {
  return new Server(namespace, methods);
};

Server.prototype._onMessage = function(data) {
  // Is this a message from us? If so ignore
  if(data.uid === this._id) return;

  // Is this for the correct namespace?
  if(data.namespace !== this._namespace) return;

  if(api.hasOwnProperty(data.type)) {
    api[data.type].call(this, data);
  } else {
    if(console) console.error(data.type+": unsupported");
  }
};

Server.prototype.listen = function(transport) {
  transport.on("message", this._onMessageBind);
  this._transport = transport;
  return this;
}

Server.prototype.close = function() {
  this._transport.removeListener("message", this._onMessageBind);
  this._transport.destroy();
  this._transport = null;
  return this;
}

module.exports = Server;
