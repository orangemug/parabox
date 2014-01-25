var Event = require("event");

/**
 * function send(data) {};
 * Object which fires a `message`
 *
 * @return Object with send method
 */
function PostMessage(targetHost, targetClient, opts) {
  opts = opts || {};
  var allowedHosts = opts.allowedHosts || "*";
  var self         = this;

  function send(data) {
    if(typeof(data) === "object") {
      data = JSON.stringify(data);
    }
    targetClient.postMessage(data, allowedHosts);
  }

  var ret = Event({
    send: send
  });

  targetHost.addEventListener("message", function(e) {
    ret.fire("message", JSON.parse(e.data));
  }, allowedHosts);

  return ret;
}

module.exports = PostMessage;
