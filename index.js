module.exports = {
  Client: require("./lib/client"),
  Server: require("./lib/server"),
  postmessage:  require("./lib/transport/postmessage"),
  messageTransport:  require("./lib/transport/message-transport")
};
