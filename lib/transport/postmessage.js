var events = require("events");
var util = require("util");
var messageTransport = require("./message-transport");

/**
 * function send(data) {};
 * Object which fires a `message`
 *
 * @return Object with send method
 */
function PostMessage(targetHost, targetClient, opts) {
  opts = opts || {};
  var self = this;

  this._allowedHosts = opts.allowedHosts || "*";
  this._targetHost   = targetHost;
  this._targetClient = targetClient;

  this._onMessage = function(e) {
    self.emit("message", JSON.parse(e.data));
  }

  targetHost.addEventListener("message", this._onMessage, this._allowedHosts);
}

// Extend the event emitter
util.inherits(PostMessage, events.EventEmitter);

PostMessage.prototype.send = function(data) {
  if(typeof(data) === "object") {
    data = JSON.stringify(data);
  }
  this._targetClient.postMessage(data, this._allowedHosts);
};

PostMessage.prototype.destroy = function() {
  this._targetHost.removeEventListener("message", this._onMessage);
};


module.exports = messageTransport(PostMessage);
