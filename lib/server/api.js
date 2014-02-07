/**
 * Internal Server API
 *
 * Gets called in the context of a server object.
 */
module.exports = {
  /**
   * Retrieve the methods bound to the object
   * @param {Object} data
   */
  methods: function(data) {
    ret = Object.getOwnPropertyNames(this._methods);
    this._transport.send({
      uid: this._id,
      rid: data.mid,
      namespace: this._namespace,
      type: "methods",
      data: ret
    });
  },

  /**
   * Call a bound method
   * @param {Object} data
   */
  call: function(data) {
    var ret = this._methods[data.methodName].apply(this, data.data);
    if(data.respRequired) {
      this._transport.send({
        uid: this._id,
        to: data.senderUid,
        namespace: this._namespace,
        type: "call",
        rid: data.mid,
        data: ret
      });
    }
  }
};
