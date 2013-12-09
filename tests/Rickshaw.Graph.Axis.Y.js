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
		height: 600,
		element: element,
		series: [ { data: [ { x: 4, y: 32 }, { x: 16, y: 100 } ] } ]
	});

	var yAxis = new Rickshaw.Graph.Axis.Y({
		graph: graph
	});

	yAxis.render();

	var ticks = d3.select(element).selectAll('.y_grid .tick')

	test.equal(ticks[0].length, 11, "we have some ticks");
	test.equal(ticks[0][0].getAttribute('data-y-value'), '0');

	test.done();
};

