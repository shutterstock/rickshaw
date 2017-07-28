var d3 = require("d3");
var Rickshaw;

exports.setUp = function(callback) {

	Rickshaw = require('../rickshaw');

	global.document = require("jsdom").jsdom("<html><head></head><body></body></html>");
	global.window = document.defaultView;

	new Rickshaw.Compat.ClassList();

	callback();
};

exports.tearDown = function(callback) {

	delete require.cache.d3;
	callback();
};

exports.drag = function(test) {

	var element = document.createElement("div");

	var graph = new Rickshaw.Graph({
		element: element,
		width: 960,
		height: 500,
		renderer: 'scatterplot',
		series: [{
			color: 'steelblue',
			data: [{
				x: 0,
				y: 40
			}, {
				x: 1,
				y: 49
			}, {
				x: 2,
				y: 38
			}, {
				x: 3,
				y: 30
			}, {
				x: 4,
				y: 32
			}]
		}]
	});

	graph.renderer.dotSize = 6;
	graph.render();

	var drag = new Rickshaw.Graph.DragZoom({
		graph: graph,
		opacity: 0.5,
		fill: 'steelblue',
		minimumTimeSelection: 15,
		callback: function(args) {
			console.log(args.range, args.endTime);
		}
	});

	test.equal(graph.renderer.name, drag.graph.renderer.name);
	test.equal(drag.svgWidth, 960);

	var rect = d3.select(element).selectAll('rect')[0][0];
	test.equal(rect, undefined, 'we dont have a rect for drawing drag zoom');

	var event = global.document.createEvent('MouseEvent');
	event.initMouseEvent('mousedown', true, true, window, 1, 800, 600, 290, 260, false, false, false, false, 0, null);
	test.equal(event.screenX, 800, 'jsdom initMouseEvent works');
	drag.svg[0][0].dispatchEvent(event);

	rect = d3.select(element).selectAll('rect')[0][0];
	test.ok(rect, 'after mousedown we have a rect for drawing drag zoom');
	test.equal(rect.style.opacity, drag.opacity);

	event = global.document.createEvent('MouseEvent');
	event.initMouseEvent('mousemove', true, true, window, 1, 900, 600, 290, 260, false, false, false, false, 0, null);
	drag.svg[0][0].dispatchEvent(event);

	// TODO offsetX is not currently set on d3.event in d3 v3 when run with jsdom
	test.equal(rect.attributes.fill, null);
	test.equal(rect.attributes.x, null);
	test.equal(rect.attributes.width, null);

	event = global.document.createEvent('KeyboardEvent');
	event.initEvent('keyup', true, true, null, false, false, false, false, 12, 0);
	global.document.dispatchEvent(event);

	var ESCAPE_KEYCODE = 27;
	event = global.document.createEvent('KeyboardEvent');
	event.initEvent('keyup', true, true, null, false, false, false, false, ESCAPE_KEYCODE, 0);
	global.document.dispatchEvent(event);

	test.done();
};

exports.notDrag = function(test) {

	var element = document.createElement("div");

	var graph = new Rickshaw.Graph({
		element: element,
		width: 960,
		height: 500,
		renderer: 'scatterplot',
		series: [{
			color: 'steelblue',
			data: [{
				x: 0,
				y: 40
			}, {
				x: 1,
				y: 49
			}, {
				x: 2,
				y: 38
			}, {
				x: 3,
				y: 30
			}, {
				x: 4,
				y: 32
			}]
		}]
	});

	graph.renderer.dotSize = 6;
	graph.render();

	var drag = new Rickshaw.Graph.DragZoom({
		graph: graph,
		opacity: 0.5,
		fill: 'steelblue',
		minimumTimeSelection: 15,
		callback: function(args) {
			console.log(args.range, args.endTime);
		}
	});

	test.equal(graph.renderer.name, drag.graph.renderer.name);
	test.equal(drag.svgWidth, 960);

	var rect = d3.select(element).selectAll('rect')[0][0];
	test.equal(rect, undefined, 'we dont have a rect for drawing drag zoom');

	var event = global.document.createEvent('MouseEvent');
	event.initMouseEvent('mousedown', true, true, window, 1, 800, 600, 290, 260, false, false, false, false, 0, null);
	test.equal(event.screenX, 800, 'jsdom initMouseEvent works');
	drag.svg[0][0].dispatchEvent(event);

	rect = d3.select(element).selectAll('rect')[0][0];
	test.ok(rect, 'after mousedown we have a rect for drawing drag zoom');
	test.equal(rect.style.opacity, drag.opacity);

	event = global.document.createEvent('MouseEvent');
	event.initMouseEvent('mouseup', true, true, window, 1, 900, 600, 290, 260, false, false, false, false, 0, null);
	global.document.dispatchEvent(event);

	rect = d3.select(element).selectAll('rect')[0][0];
	test.equal(rect, null, 'after mouseup rect is gone');

	// This is not reproduceable in the browser
	event = global.document.createEvent('MouseEvent');
	event.initMouseEvent('mousedown', true, true, window, 1, 800, 600, 290, 260, false, false, false, false, 0, null);
	drag.svg[0][0].dispatchEvent(event);
	test.equal(rect, null, 'after mouseup mousedown listener is gone');

	test.done();
};

exports.initialize = function(test) {

	var el = document.createElement("div");

	try {
		var drag = new Rickshaw.Graph.DragZoom();
	} catch (err) {
		test.equal(err.message, "Rickshaw.Graph.DragZoom needs a reference to a graph");
	}

	test.done();
};
