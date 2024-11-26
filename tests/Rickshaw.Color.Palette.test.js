var Rickshaw = require('../rickshaw')

exports.initialize = function(test) {

  var palette = new Rickshaw.Color.Palette();

  test.equal(typeof palette.schemes, 'object');
  test.deepEqual(palette.scheme, [
    '#cb513a',
    '#73c03a',
    '#65b9ac',
    '#4682b4',
    '#96557e',
    '#785f43',
    '#858772',
    '#b5b6a9'
  ]);
  test.equal(palette.runningIndex, 0);
  test.equal(palette.generatorIndex, 0);
  test.equal(palette.rotateCount, 8);
  test.equal(typeof palette.color, 'function');
  test.equal(typeof palette.interpolateColor, 'function');

  test.done();
};

exports.interpolatedStopCount = function(test) {

  var palette = new Rickshaw.Color.Palette({
    interpolatedStopCount: 4
  });

  test.equal(typeof palette.schemes, 'object');
  test.deepEqual(palette.scheme, [
    '#cb513a',
    '#c98339',
    '#c7b439',
    '#a5c439',
    '#73c03a',
    '#51c043',
    '#4fbd66',
    '#5abb8d',
    '#65b9ac',
    '#5db8b8',
    '#55a9b7',
    '#4c97b7',
    '#4682b4',
    '#4a51ac',
    '#724ea5',
    '#95519d',
    '#96557e',
    '#8f5066',
    '#874c4f',
    '#805547',
    '#785f43',
    '#7d6d4e',
    '#817959',
    '#848365',
    '#858772',
    '#91937f',
    '#9d9f8d',
    '#a9aa9b',
    '#b5b6a9'
  ]);
  test.equal(palette.runningIndex, 0);
  test.equal(palette.generatorIndex, 0);
  test.equal(palette.rotateCount, 29);
  test.equal(typeof palette.color, 'function');
  test.equal(typeof palette.interpolateColor, 'function');

  test.done();
};

exports.interpolateColor = function(test) {

  var palette = new Rickshaw.Color.Palette();

  var color = palette.interpolateColor();
  test.equal(typeof palette.schemes, 'object');
  test.deepEqual(color, palette.scheme[palette.scheme.length - 1]);

  palette.generatorIndex = palette.rotateCount * 2 - 1;
  color = palette.interpolateColor();
  test.equal(typeof palette.schemes, 'object');
  test.deepEqual(color, palette.scheme[palette.scheme.length - 1]);

  palette.scheme = null;
  color = palette.interpolateColor();
  test.equal(color, undefined, 'color is undefined if scheme is not an array');

  test.done();
};
