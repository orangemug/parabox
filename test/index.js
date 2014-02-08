var parabox = require("./../");
var assert = require("assert");

var transport = new parabox.postmessage(window, window);

describe("parabox-server", function() {

  it("bind method", function(done) {
    var bindObj = {
      test: function(a, b) {
        assert.equal(a, 1);
        assert.equal(b, "two");
        server.close();
        done();
      }
    };

    var server = parabox.Server.create("test1", bindObj);
    server.listen(transport);

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

    var server = parabox.Server.create("test2", bindObj);
    server.listen(transport);

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
      server.close();
      done()
    });


  });
});


describe("parabox-client", function() {
  it("test string request/response", function(done) {
    var client;
    var server = parabox.Server.create("reqresp", {
      echo: function(msg) {
        return msg;
      }
    });
    server.listen(transport);

    client = parabox.Client.create("reqresp");
    client.connect(transport, function(err, conn) {
      assert.equal(err, false);
      conn.remote.echo("hi", function(msg) {
        assert.equal(msg, "hi");
        server.close();
        done();
      });
    });
  });

  it("test object request/response", function(done) {
		var testObj = {a: 1, b: 2, c: 3};

    var server = parabox.Server.create("test3", {
      echo: function(msg) {
        return msg;
      }
    });
    server.listen(transport);

    var client = parabox.Client.create("test3");
    client.connect(transport, function(err, conn) {
      assert.equal(err, false);
      conn.remote.echo(testObj, function(msg) {
        assert.equal(msg.a, testObj.a);
        assert.equal(msg.b, testObj.b);
        assert.equal(msg.c, testObj.c);
        server.close();
        done();
      });
    });
  });

  it("test calling buffered methods", function(done) {
		var args = "msg";
    var methods = ["echo"];

    var callCount = 0;
    var callback = function(msg) {
      assert.equal(msg, args);
      callCount++;
      if(callCount > 1) {
        server.close();
        done();
      }
    }

    var client = parabox.Client.create("test4", methods);
    var conn = client.connect(transport, function(err, conn2) {
      assert.equal(err, false);
    });

    // Call #1
    conn.remote.echo(args, callback);

    var server = parabox.Server.create("test4", {
      echo: function(msg) {
        return msg;
      }
    })
    server.listen(transport);

    // Call #2
    setTimeout(function() {
      conn.remote.echo(args, callback);
    }, 500);
  });

  it("error if server doesn't support supplied methods", function(done) {
    var methods = ["foo"];

    var client = parabox.Client.create("test5", methods);
    var conn = client.connect(transport, function(err, conn2) {
      assert.equal(err, "Missing methods");
      server.close();
      done();
    });

    var server = parabox.Server.create("test5", {
      bar: function() {}
    })
    server.listen(transport);
  });

});

