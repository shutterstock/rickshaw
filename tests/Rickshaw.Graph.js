var fs = require('fs');
var Rickshaw;

exports.setUp = function(callback) {

	Rickshaw = require('../rickshaw');

	global.document = d3.select('html')[0][0].parentNode;
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
				{ x: 3, y: 30 },
				{ x: 4, y: 32 } ]
			}]
	} );

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

exports.timeScale = function(test) {

	var el = document.createElement("div");

	var times = [1380000000000, 1390000000000];
	var series = [
		{
			color: 'steelblue',
			data: [ { x: times[0], y: 40 }, { x: times[1], y: 49 } ]
		}
	];

	var graph = new Rickshaw.Graph({
		element: el,
		width: 960,
		height: 500,
		xScale: d3.time.scale(),
		series: series
	});
	graph.render();

	var xAxis = new Rickshaw.Graph.Axis.X({
		graph: graph,
		tickFormat: graph.x.tickFormat()
	});
	xAxis.render();
	test.ok(graph.x.ticks()[0] instanceof Date);
	var ticks = el.getElementsByClassName('x_ticks_d3')[0].getElementsByTagName('text');
	test.equal('Sep 29', ticks[0].innerHTML);
	test.equal('Oct 06', ticks[1].innerHTML);
	test.equal('Nov 24', ticks[8].innerHTML);

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

