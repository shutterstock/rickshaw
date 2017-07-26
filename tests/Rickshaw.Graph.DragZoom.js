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

exports.basic = function(test) {

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
	test.done();
};


