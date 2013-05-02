var fs = require('fs');

exports.svg = function(test) {

	var jsdom    = require("jsdom").jsdom;
	global.document = jsdom("<html><head></head><body></body></html>");
	global.window   = global.document.createWindow();

	var Rickshaw = require('../rickshaw');
	new Rickshaw.Compat.ClassList();

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

exports.inconsistent = function(test) {

	var jsdom    = require("jsdom").jsdom;
	global.document = jsdom("<html><head></head><body></body></html>");
	global.window   = global.document.createWindow();

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
