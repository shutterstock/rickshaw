var d3 = require('d3');
var jsdom = require('jsdom').jsdom;
var sinon = require('sinon');

var Rickshaw;

exports.setUp = function(callback) {

  Rickshaw = require('../rickshaw');

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

  var hoverDetail = new Rickshaw.Graph.HoverDetail({
    graph: graph
  });

  test.equal(hoverDetail.visible, true, 'visible by default');

  test.equal(typeof hoverDetail.formatter, 'function', 'we have a default xFormatter');
  test.equal(typeof hoverDetail.xFormatter, 'function', 'we have a default xFormatter');
  test.equal(typeof hoverDetail.yFormatter, 'function', 'we have a default yFormatter');

  var detail = d3.select(element).selectAll('.detail')
  test.equal(hoverDetail.element, detail[0][0]);
  test.equal(detail[0].length, 1, 'we have a div for hover detail');

  test.done();
};

exports.formatters = function(test) {

  var element = document.createElement('di1v');

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

  var hoverDetail = new Rickshaw.Graph.HoverDetail({
    graph: graph,
    formatter: sinon.spy(),
    xFormatter: sinon.spy(),
    yFormatter: sinon.spy()
  });

  test.equal(hoverDetail.formatter.calledOnce, false, 'accepts a formatter function');
  test.equal(hoverDetail.xFormatter.calledOnce, false, 'accepts a xFormatter function');
  test.equal(hoverDetail.yFormatter.calledOnce, false, 'accepts a yFormatter function');

  hoverDetail.formatter();
  test.equal(hoverDetail.formatter.calledOnce, true, 'accepts a formatter function');

  hoverDetail.xFormatter();
  test.equal(hoverDetail.xFormatter.calledOnce, true, 'accepts a xFormatter function');

  hoverDetail.yFormatter();
  test.equal(hoverDetail.yFormatter.calledOnce, true, 'accepts a yFormatter function');

  test.done();
};

exports.render = function(test) {

  var element = document.createElement('div');

  var graph = new Rickshaw.Graph({
    width: 900,
    element: element,
    series: [{
      name: 'testseries',
      data: [{
        x: 4,
        y: 32
      }, {
        x: 16,
        y: 100
      }]
    }]
  });

  var hoverDetail = new Rickshaw.Graph.HoverDetail({
    graph: graph,
    onShow: sinon.spy(),
    onHide: sinon.spy(),
    onRender: sinon.spy(),
  });

  hoverDetail.render({
    points: [{
      active: true,
      series: graph.series[0],
      value: {
        y: null
      }
    }]
  });

  var items = d3.select(element).selectAll('.item');
  test.equal(items[0].length, 0, 'we if y is null nothing is rendered');

  hoverDetail.render({
    points: [{
      active: true,
      series: graph.series[0],
      value: graph.series[0].data[0],
      formattedXValue: graph.series[0].data[0].x + ' foo',
      formattedYValue: graph.series[0].data[0].y + ' bar'
    }, {
      active: true,
      series: graph.series[0],
      value: graph.series[0].data[1]
    }, {
      active: true,
      series: graph.series[0],
      value: {
        y: null
      }
    }]
  });

  test.equal(hoverDetail.onShow.calledOnce, true, 'calls onShow');
  test.equal(hoverDetail.onRender.calledOnce, true, 'calls onRender');

  var xLabel = d3.select(element).selectAll('.x_label');
  test.equal(xLabel[0].length, 1, 'we have a div for x label');
  test.equal(xLabel[0][0].innerHTML, '4 foo', 'x label shows formatted x value');

  var items = d3.select(element).selectAll('.item');
  test.equal(items[0].length, 1, 'we have a div for hover detail');
  test.equal(items[0][0].innerHTML, 'testseries:&nbsp;32 bar', 'item shows series label and formatted y value');

  var dots = d3.select(element).selectAll('.dot');
  test.equal(dots[0].length, 1, 'we have a div for hover dot');

  hoverDetail.hide();
  test.equal(hoverDetail.onHide.calledOnce, true, 'calls onHide');

  hoverDetail.render({
    points: [{
      active: true,
      series: graph.series[0],
      value: {
        y: null
      }
    }]
  });

  test.done();
};

exports.update = function(test) {

  var element = document.createElement('div');

  var graph = new Rickshaw.Graph({
    width: 900,
    element: element,
    series: [{
      name: 'testseries',
      data: [{
        x: 4,
        y: 32
      }, {
        x: 16,
        y: 100
      }]
    }]
  });

  var hoverDetail = new Rickshaw.Graph.HoverDetail({
    graph: graph
  });
  hoverDetail.render = sinon.spy();

  hoverDetail.update();
  test.equal(hoverDetail.render.calledOnce, false, 'update isnt called if there is no event');

  var moveEvent = global.document.createEvent('Event');
  moveEvent.initEvent('mousemove', true, true);
  moveEvent.relatedTarget = {
    compareDocumentPosition: sinon.spy()
  };
  element.dispatchEvent(moveEvent);
  test.equal(hoverDetail.render.calledOnce, false, 'update is only called on path, svg, rect, circle');

  var svg = d3.select(element).selectAll('svg')[0][0];
  moveEvent.target = svg;
  svg.dispatchEvent(moveEvent);
  test.equal(hoverDetail.render.calledOnce, true, 'update calls render if visible');
  test.equal(hoverDetail.element.innerHTML, '', 'detail should be empty');

  hoverDetail.render = sinon.spy();
  graph.series.push({
    name: 'test empty series',
    data: []
  });
  svg.dispatchEvent(moveEvent);
  test.equal(hoverDetail.render.calledOnce, false, 'update isnt called if there is no active series');

  test.done();
};

exports.listeners = function(test) {

  var element = document.createElement('div');

  var graph = new Rickshaw.Graph({
    width: 900,
    element: element,
    series: [{
      name: 'testseries',
      data: [{
        x: 4,
        y: 32
      }, {
        x: 16,
        y: 100
      }]
    }]
  });
  test.equal(typeof graph.element, 'object', 'graph has an element');
  test.equal(graph.element, element, 'graph has an element');

  var hoverDetail = new Rickshaw.Graph.HoverDetail({
    graph: graph,
    onHide: sinon.spy()
  });

  test.equal(typeof hoverDetail.mousemoveListener, 'function', 'we have a default mousemoveListener');
  test.equal(typeof hoverDetail.mouseoutListener, 'function', 'we have a default mouseoutListener');

  var event = global.document.createEvent('Event');
  event.initEvent('mouseout', true, true);
  event.relatedTarget = {
    compareDocumentPosition: sinon.spy()
  };
  element.dispatchEvent(event);
  test.equal(hoverDetail.onHide.calledOnce, true, 'calls onHide');
  test.equal(hoverDetail.visible, false);

  // simulating clearing the element's html in 
  // angular/backbone/react or other SPA framework
  test.equal(hoverDetail.element.parentNode, element);
  test.equal(element.childNodes.length, 2, 'has two child nodes');
  test.equal(hoverDetail.element.parentNode, element, 'has reference to its parent node');
  graph.element.removeChild(element.childNodes[0]);
  graph.element.removeChild(element.childNodes[0]);
  test.equal(element.innerHTML, '', 'removed all child nodes');
  test.equal(hoverDetail.element.parentNode, null);

  hoverDetail.update = sinon.spy();
  test.equal(hoverDetail.update.calledOnce, false);

  var moveEvent = global.document.createEvent('Event');
  moveEvent.initEvent('mousemove', true, true);
  moveEvent.relatedTarget = {
    compareDocumentPosition: sinon.spy()
  };
  element.dispatchEvent(moveEvent);
  test.equal(hoverDetail.visible, true);
  test.equal(hoverDetail.update.calledOnce, true);

  hoverDetail.update = sinon.spy();
  hoverDetail._removeListeners();
  element.dispatchEvent(moveEvent);
  test.equal(hoverDetail.update.calledOnce, false);

  test.done();
};
