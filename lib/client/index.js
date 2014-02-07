var guid = require("../guid");
var Connection = require("./connection");

/**
 * Create a RPC client
 *
 * @param {String} namespace server namespace should be uniq for your app
 * @param {Array} methods to pre-bind
 */
function Client(namespace, methods) {
  this.remote = {};
  this._id = guid();
  this._methods = methods;
  this._namespace = namespace;
}

Client.create = function(namespace, methods) {
  return new Client(namespace, methods);
}

/**
 * Create a connection
 */
Client.prototype.connect = function(transport, done) {
  return new Connection(this, transport, done);
};

/**
 *
 */
Client.prototype.getNamespace = function() {
  return this.namespace;
};

/**
 *
 */
Client.prototype.getMethods = function() {
  return this.methods;
};

/**
 * Disconnect from the transport layer
 */
Client.prototype.close = function() {
  this._transport.close();
  this._transport = null;
};

module.exports = Client;
