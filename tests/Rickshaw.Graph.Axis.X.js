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

exports.axis = function(test) {

	var element = document.createElement('div');

	var graph = new Rickshaw.Graph({
		width: 900,
		element: element,
		series: [ { data: [ { x: 4, y: 32 }, { x: 16, y: 100 } ] } ]
	});

	var xAxis = new Rickshaw.Graph.Axis.X({
		graph: graph
	});

	xAxis.render();

	var ticks = d3.select(element).selectAll('.x_grid_d3 .tick')

	test.equal(ticks[0].length, 13, "we have some ticks");
	test.equal(ticks[0][0].getAttribute('data-x-value'), '4');

	test.done();
};

