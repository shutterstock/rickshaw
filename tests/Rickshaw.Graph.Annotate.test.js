var d3 = require('d3');
var jsdom = require('jsdom').jsdom;

var Rickshaw = require('../rickshaw');

exports.setUp = function(callback) {

  global.document = jsdom('<html><head></head><body></body></html>');
  global.window = document.defaultView;
  global.Node = {};

  new Rickshaw.Compat.ClassList();

  callback();
};

exports.tearDown = function(callback) {

  delete require.cache.d3;
  callback();
};

exports.initialize = function(test) {

  var element = document.createElement('div');
  var annotateElement = document.createElement('div');

  var graph = new Rickshaw.Graph({
    width: 900,
    element: element,
    series: [{
      data: [{
        x: 4,
        y: 32
      }, {
        x: 16,
        y: 100
      }]
    }]
  });

  var annotate = new Rickshaw.Graph.Annotate({
    graph: graph,
    element: annotateElement
  });

  test.equal(annotate.elements.timeline, annotateElement);
  var timeline = d3.select(element).selectAll('.rickshaw_annotation_timeline');
  test.equal(annotate.element, timeline[0][0]);

  test.done();
};

exports.add = function(test) {

  var element = document.createElement('div');
  var annotateElement = document.createElement('div');

  var graph = new Rickshaw.Graph({
    element: element,
    series: []
  });

  var annotate = new Rickshaw.Graph.Annotate({
    graph: graph,
    element: annotateElement
  });

  var time = Date.now();
  annotate.add(time, 'foo', time + 10 * 1000);

  test.deepEqual(annotate.data[time], {
    boxes: [{
      content: 'foo',
      end: time + 10 * 1000
    }]
  });

  test.done();
};

exports.update = function(test) {

  var element = document.createElement('div');
  var annotateElement = document.createElement('div');

  var graph = new Rickshaw.Graph({
    element: element,
    series: []
  });

  var annotate = new Rickshaw.Graph.Annotate({
    graph: graph,
    element: annotateElement
  });

  var time = 3000;
  annotate.add(time, 'foo', time + 10 * 1000);

  annotate.update();

  var clickEvent = global.document.createEvent('Event');
  clickEvent.initEvent('click', true, true);
  var addedElement = d3.select(annotateElement).selectAll('.annotation')[0][0];
  addedElement.dispatchEvent(clickEvent);

  test.deepEqual(addedElement.classList, {
    '0': 'annotation',
    '1': 'active'
  });

  annotate.graph.onUpdate();
  annotate.update();

  test.deepEqual(addedElement.style._values, {
    display: 'block'
  });

  test.deepEqual(annotate.data[time].element.classList, {
    '0': 'annotation',
    '1': 'active'
  });

  test.done();
};
