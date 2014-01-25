var parabox = require("./../");
var messageTransport = require("./../lib/transport/message-transport");
var assert = require("assert");

var transport = messageTransport(parabox.postmessage(window, window));

describe("parabox-server", function() {

  it("bind method", function(done) {
    var bindObj = {
      test: function(a, b) {
        assert.equal(a, 1);
        assert.equal(b, "two");
        done();
      }
    };

    var serverXhr = parabox.createServer("test1", transport, bindObj);

    transport.send({
      uid: 1,
      type: "call",
      namespace: "test1",
      methodName: "test",
      data: [1,"two"]
    });

  });

  it("bind method return", function(done) {
    var bindObj = {
      test: function() {
        return "hello";
      }
    };

    var serverXhr = parabox.createServer("test2", transport, bindObj);

    transport.send({
      uid: 1,
      mid: 2,
      type: "call",
      namespace: "test2",
      methodName: "test",
      data: [1,"two"],
			respRequired: true
    }, function(data) {
      assert(data.data, "hello");
      done()
    });


  });
});


describe("parabox-client", function() {
  it("test string request/response", function(done) {
    var serverXhr = parabox.createServer("reqresp", transport, {
      echo: function(msg) {
        return msg;
      }
    });

    parabox.createClient("reqresp", transport, {}, function(err, obj) {
      obj.echo("hi", function(msg) {
        assert.equal(msg, "hi");
        done();
      });
    });
  });

  it("test object request/response", function(done) {
		var testObj = {a: 1, b: 2, c: 3};

    var serverXhr = parabox.createServer("test3", transport, {
      echo: function(msg) {
        return msg;
      }
    });

    parabox.createClient("test3", transport, {}, function(err, obj) {
      obj.echo(testObj, function(msg) {
				// FIXME
        assert.equal(msg.a, testObj.a);
        assert.equal(msg.b, testObj.b);
        assert.equal(msg.c, testObj.c);
        done();
      });
    });
  });
});

