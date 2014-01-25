/**
 * Wrap a transport definition
 */
module.exports = function(obj) {
  var uid = 0;

  var oldSend = obj.send;

  obj.send = function(data, done) {
    var self = this;
    var mid  = uid++;

    var handler = function(data) {
      if(mid === data.rid) {
        if(done) {
					done(data);
				}
      }
    };

    // Receive
    this.on("message", handler);

    // Timeout
    setTimeout(function() {
      self.off("message", handler);
    }, 2000);

    data.mid = mid;

    // Call super
    oldSend.call(this, data);
  }

  return obj;
}
