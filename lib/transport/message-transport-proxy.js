/**
 * Proxy methods between two transports
 *
 * @param transportA
 * @param transportB
 */
module.exports = function(transportA, transportB) {
  transportA.on("message", function() {
    transportB.send(arguments);
  });

  transportB.on("message", function() {
    transportA.send(arguments);
  });

}
