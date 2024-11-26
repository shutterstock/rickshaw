var d3 = require("d3");
var fs = require('fs');
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

exports.svg = function(test) {

	var el = document.createElement("div");

	var graph = new Rickshaw.Graph({
		element  : el,
		width    : 960,
		height   : 500,
		renderer : 'scatterplot',
		series   : [{
			color : 'steelblue',
			data  : [
				{ x: 0, y: 40 },
				{ x: 1, y: 49 },
				{ x: 2, y: 38 },
				{ x: 3, y: 30 }
			],
			strokeWidth: 5,
			opacity: 0.8
		}, {
			color : 'blue',
			data  : [ { x: 4, y: 32 } ]
		}]
	});

	graph.renderer.dotSize = 6;
	graph.render();

	var generatedSVG = el.innerHTML;

	var exampleSVGFilename = __dirname + '/data/simple.svg';
	var exampleSVG = fs.readFileSync(exampleSVGFilename, 'utf8').trim();

	test.equal(generatedSVG, exampleSVG, "simple graph svg content matches");

	test.done();
};

exports.validate = function(test) {

	var el = document.createElement("div");

	test.throws( function() {

		var graph = new Rickshaw.Graph({
			element: el,
			width: 960,
			height: 500,
			series: [{
				color : 'steelblue',
				data  : [
					{ x: 0, y: 40 },
					{ x: 5, y: 49 },
					{ x: 2, y: 38 },
					{ x: 3, y: 30 },
					{ x: 4, y: 32 } ]
				}]
		} );

	}, null, "out of order data points throws an error" );

	test.done();

};

exports['should validate empty data when rendering multiple series'] = function(test) {
	var el = document.createElement("div");

	try {
		var graph = new Rickshaw.Graph({
			element: el,
			width: 960,
			height: 500,
			renderer: 'line',
			series: [
				{data: [], name:'first: empty'},{
				data  : [
					{ x: 0, y: 40 },
					{ x: 1, y: 49 },
					{ x: 2, y: 38 },
					{ x: 3, y: 30 },
					{ x: 4, y: 32 } ],
				name: '5 datas'
				},
				{data: [], name:'last: empty'}]
		});
	} catch (error) {
		test.fail(error);
	}
	//test.deepEquals(graph.domain(), [NaN, NaN], should have proper );


	test.done();
};

exports.scales = function(test) {

	var el = document.createElement("div");

	var times = [1380000000000, 1390000000000];

	var series = [
		{
			color: 'steelblue',
			data: [ { x: times[0], y: 40 }, { x: times[1], y: 49 } ]
		}
	];

	var scale = d3.time.scale();
	var graph = new Rickshaw.Graph({
		element: el,
		width: 960,
		height: 500,
		xScale: scale,
		yScale: d3.scale.sqrt(),
		series: series
	});

	graph.render();

	var xAxis = new Rickshaw.Graph.Axis.X({
		graph: graph,
		tickFormat: graph.x.tickFormat()
	});

	xAxis.render();

	var yAxis = new Rickshaw.Graph.Axis.Y({
		graph: graph
	});

	yAxis.render();

	test.ok(graph.x.ticks()[0] instanceof Date);
	var xTicks = el.getElementsByClassName('x_ticks_d3')[0].getElementsByTagName('text');
	test.equal(xTicks[0].innerHTML, 'Sep 29');
	test.equal(xTicks[1].innerHTML, 'Oct 06');
	test.equal(xTicks[8].innerHTML, 'Nov 24');

	var yTicks = el.getElementsByClassName('y_ticks')[0].getElementsByTagName('g');
	test.equal(yTicks[0].getAttribute('transform'), 'translate(0,500)');
	test.equal(yTicks[1].getAttribute('transform'), 'translate(0,275.24400874015976)');
	test.equal(yTicks[2].getAttribute('transform'), 'translate(0,182.14702893572516)');

	// should make a copy mutable object
	scale.range([0, 960]);
	test.deepEqual(scale.range(), graph.x.range());
	scale.range([0, 1])
	test.notDeepEqual(scale.range(), graph.x.range());

	test.done();
};

exports.inconsistent = function(test) {

	var el = document.createElement("div");

	var series = [
		{
			color: 'steelblue',
			data: [ { x: 0, y: 40 }, { x: 1, y: 49 }, { x: 2, y: 38 } ]
		}, {
			color: 'red',
			data: [ { x: 0, y: 40 }, { x: 1, y: 49 }, { x: 2, y: 38 } ]
		}
	];

	test.doesNotThrow( function() {

		var graph = new Rickshaw.Graph({
			element: el,
			width: 960,
			height: 500,
			renderer: 'stack',
			series: series
		});

	}, "create basic graph okay" );

	series[0].data.push( { x: 3, y: 88 } );

	test.doesNotThrow( function() {

		var graph = new Rickshaw.Graph({
			element: el,
			width: 960,
			height: 500,
			renderer: 'line',
			series: series
		});

	}, "we don't throw for inconsistent length series for lines" );

	test.throws( function() {

		var graph = new Rickshaw.Graph({
			element: el,
			width: 960,
			height: 500,
			renderer: 'stack',
			series: series
		});

	}, null, "throw for inconsistent stacked series for stack renderer" );

	test.throws( function() {

		var graph = new Rickshaw.Graph({
			element: null,
			width: 960,
			height: 500,
			renderer: 'stack',
			series: series
		});

	}, null, "throw an error for undefined element reference" );

	test.done();
};

exports.configure = function(test) {

	var el = document.createElement('div');

	var graph = new Rickshaw.Graph({
		element: el,
		width: 960,
		height: 500,
		padding: { top: 0.2 },
		renderer: 'stack',
		series: [ { data: [ { x: 1, y: 40 } ] } ]
	});

	test.deepEqual(graph.renderer.padding, { bottom: 0.01, right: 0, left: 0, top: 0.2 },
		"padding makes it through to renderer from constructor");

	test.strictEqual(typeof graph.padding, "undefined",
		"padding not set on graph from constructor");

	graph.configure({ padding: { top: 0.25, bottom: 0.25, right: 0.25, left: 0.25 } });

	test.deepEqual(graph.renderer.padding, { bottom: 0.25, right: 0.25, left: 0.25, top: 0.25 },
		"padding makes it through to renderer from configure");

	test.strictEqual(typeof graph.padding, "undefined",
		"padding not set on graph from configure");

	var callback = function(args) {
		if (callback.called) return;
		test.deepEqual(args, { interpolation: 'step-after' }, "configure args match");
		callback.called = true;
	};

	graph.onConfigure(callback);
	graph.configure({ interpolation: 'step-after' });

	test.equal(graph.interpolation, 'step-after', "interpolation set on graph");
	test.ok(callback.called, "configure callback was called");
	test.equal(graph.config.interpolation, 'step-after', "configuration object has interpolation set");

	graph.configure({ width: 900, height: 100 });

	test.deepEqual([ graph.width, graph.height ], [ 900, 100 ], "graph dimensions take");
	test.deepEqual(graph.vis[0][0].getAttribute('width'), 900, "width set on svg");
	test.deepEqual(graph.vis[0][0].getAttribute('height'), 100, "height set on svg");

	test.done();
};

exports.setSeries = function(test) {

  var el = document.createElement('div');

  var graph = new Rickshaw.Graph({
    element: el,
    width: 960,
    height: 500,
    padding: { top: 0.2 },
    renderer: 'stack',
    series: [ { data: [ { x: 1, y: 40 } ] } ]
  });

  test.equal(graph.series[0].data[0].y, 40);

  graph.setSeries([{
    data: []
  }, {
    data: [{ x: 2, y: 3 }]
  }]);

  test.equal(graph.series[0].data[0], undefined);
  test.equal(graph.series[1].data[0].x, 2);

  test.done();
};

exports.rendererAutodiscover = function(test) {

	var Rickshaw = require('../rickshaw');
	new Rickshaw.Compat.ClassList();

	var el = document.createElement("div");

	var series = [
		{
			color: 'steelblue',
			data: [ { x: 0, y: 40 }, { x: 1, y: 49 }, { x: 2, y: 38 } ]
		}, {
			color: 'red',
			data: [ { x: 0, y: 40 }, { x: 1, y: 49 }, { x: 2, y: 38 } ]
		}
	];

	test.throws( function() {

		var graph = new Rickshaw.Graph({
			element: el,
			width: 960,
			height: 500,
			renderer: 'testline',
			series: series
		});

	}, null, "throw for unknown renderer" );

	Rickshaw.namespace('Rickshaw.Graph.Renderer.TestLine');

	Rickshaw.Graph.Renderer.TestLine = Rickshaw.Class.create( Rickshaw.Graph.Renderer.Line, {
		name: 'testline'
	} );

	test.doesNotThrow( function() {

		var graph = new Rickshaw.Graph({
			element: el,
			width: 960,
			height: 500,
			renderer: 'testline',
			series: series
		});

	}, "new render autodiscovered ok" );

	delete Rickshaw.Graph.Renderer.TestLine;

	test.done();
};

