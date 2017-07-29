var Rickshaw = require('../rickshaw');
var package = require('../package.json');

exports.load = function(test) {

  test.equal(Rickshaw.version, package.version, 'Rickshaw.version is defined');
  test.done();
};
