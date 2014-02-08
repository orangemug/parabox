/**
 * Wrap a transport definition
 */
module.exports = function(obj) {
  var uid = 0;

  var oldSend = obj.prototype.send;
  obj.prototype.send = function(data, done) {
    var hdl;
    var self = this;
    var mid  = uid++;

    var handler = function(data) {
      if(mid === data.rid) {
        clearTimeout(hdl);
        self.removeListener("message", handler);
        if(done) {
					done(data);
				}
      }
    };

    // Receive
    this.on("message", handler);

    // Timeout
    hdl = setTimeout(function() {
      self.removeListener("message", handler);
    }, 2000);

    data.mid = mid;

    // Call super
    oldSend.call(this, data);
  }

  return obj;
}
