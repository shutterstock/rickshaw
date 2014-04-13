var Rickshaw = require("../rickshaw");

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

exports.domain = function(test) {

	// document comes from jsdom
	var el = document.createElement("div");

	var graph = new Rickshaw.Graph({
		element: el,
		width: 960,
		height: 500,
		padding: { top: 0, right: 0, bottom: 0, left: 0 },
		renderer: 'scatterplot',
		series: [
			{
				color: 'steelblue',
				data: [
					{ x: 0, y: 40 },
					{ x: 1, y: 49 },
					{ x: 2, y: 38 },
					{ x: 3, y: 30 },
					{ x: 4, y: 32 }
				]
			}
		]
	});

	var domain = graph.renderer.domain();
	test.deepEqual(domain, { x: [ 0, 4 ], y: [ 0, 49 ] }, 'domain matches');

	// with padding

	graph.configure({ padding: { top: 0.1, right: 0.1, bottom: 0.1, left: 0.1 }});

	domain = graph.renderer.domain();
	test.deepEqual(domain, { x: [ -0.4, 4.44 ], y: [ 0, 49 + 4.9 ] }, 'domain matches with padding');

	// negative y-values minus auto

	graph.series[0].data[2].y = -72;
	graph.configure({ padding: { top: 0, right: 0, bottom: 0, left: 0 }});

	domain = graph.renderer.domain();
	test.deepEqual(domain, { x: [ 0, 4 ], y: [ 0, 49 ] }, 'domain matches with negative numbers and no auto');

	// negative y-values w/ auto

	graph.series[0].data[2].y = -72;
	graph.configure({ padding: { top: 0, right: 0, bottom: 0, left: 0 }, min: 'auto'});

	domain = graph.renderer.domain();
	test.deepEqual(domain, { x: [ 0, 4 ], y: [ -72, 49 ] }, 'domain matches with negative numbers and min auto');

	// different series lengths

	graph.series.push({
		color: 'lightblue',
		data: [ { x: 1, y: 20 }, { x: 2, y: 38 }, { x: 3, y: 30 }, { x: 4, y: 32 }, { x: 5, y: 32 } ]
	});

	graph.stackData();
	domain = graph.renderer.domain();
	test.deepEqual(domain, { x: [ 0, 5 ], y: [ -72, 49 ] }, 'multiple length series extents match');

	// null values and auto

	graph.series.splice(0, graph.series.length);
	graph.series.push({ data: [ { x: 1, y: 27 }, { x: 2, y: 49 }, { x: 3, y: 14 } ] });
	graph.series.push({ data: [ { x: 1, y: null }, { x: 2, y: 9 }, { x: 3, y: 3 } ] });

	graph.configure({ min: 'auto' });
	graph.stackData();

	domain = graph.renderer.domain();
	test.deepEqual(domain, { x: [ 1, 3 ], y: [ 3, 49 ] }, "null values don't set min to zero");

	// max of zero

	graph.series.push({ data: [ { x: 1, y: -29 }, { x: 2, y: -9 }, { x: 3, y: -3 } ] });

	graph.configure({ max: 0 });
	graph.stackData();

	domain = graph.renderer.domain();
	test.deepEqual(domain, { x: [ 1, 3 ], y: [ -29, 0 ] }, "explicit zero max doesn't fall through");

	test.done();
};

exports.respectStrokeFactory = function(test) {

	var el = document.createElement("div");
	
	Rickshaw.Graph.Renderer.RespectStrokeFactory = Rickshaw.Class.create( Rickshaw.Graph.Renderer, {

		name: 'respectStrokeFactory',
		
		seriesPathFactory: function() {
			var graph = this.graph;
			var factory = d3.svg.line()
				.x( function(d) { return graph.x(d.x) } )
				.y( function(d) { return graph.y(d.y + d.y0) } )
				.interpolate(graph.interpolation).tension(this.tension);
			factory.defined && factory.defined( function(d) { return d.y !== null } );
			return factory;
		},
		
		seriesStrokeFactory: function() {
			var graph = this.graph;
			var factory = d3.svg.line()
				.x( function(d) { return graph.x(d.x) } )
				.y( function(d) { return graph.y(d.y + d.y0) } )
				.interpolate(graph.interpolation).tension(this.tension);
			factory.defined && factory.defined( function(d) { return d.y !== null } );
			return factory;
		}
	});
	
	var graph = new Rickshaw.Graph({
		element: el,
		stroke: true,
		width: 10,
		height: 10,
		renderer: 'respectStrokeFactory',
		series: [
			{
				className: 'fnord',
				data: [
					{ x: 0, y: 40 },
					{ x: 1, y: 49 },
					{ x: 2, y: 38 },
					{ x: 3, y: 30 },
					{ x: 4, y: 32 }
				]
			}
		]
	});
	graph.render();
	
	var path = graph.vis.select('path.path.fnord');
	test.equals(path.size(), 1, "we have a fnord path");
	
	var stroke = graph.vis.select('path.stroke.fnord');
	test.equals(stroke.size(), 1, "we have a fnord stroke");
	
	// should also be availeable via series
	var firstSeries = graph.series[0];
	test.ok(d3.select(firstSeries.path).classed('path'), "selectable path");
	test.ok(d3.select(firstSeries.stroke).classed('stroke', "selectable stroke"));
	
	test.done();
};


exports['should allow arbitrary empty series when finding the domain of stacked data'] = function(test) {
	
	var el = document.createElement("div");
	
	// should not throw
	var graph = new Rickshaw.Graph({
		element: el,
		stroke: true,
		width: 10,
		height: 10,
		renderer: 'line',
		series: [
			{
				data: []
			},
			{
				data: [
					{ x: 0, y: 40 },
					{ x: 1, y: 49 },
					{ x: 2, y: 38 },
					{ x: 3, y: 30 },
					{ x: 4, y: 32 }
				]
			}
		]
	});
	test.deepEqual(graph.renderer.domain(), { x: [0, 4], y: [0, 49.49]});
	
	test.done();
};

