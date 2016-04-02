var d3 = require("d3");
var Rickshaw;

exports.setUp = function(callback) {

	Rickshaw = require('../rickshaw');

	global.document = require("jsdom").jsdom("<html><head><style>#y_axis {width: 40px;}</style></head><body><div id='y_axis'></div><div id='chart'></div></body></html>");
	global.window = document.defaultView;

	new Rickshaw.Compat.ClassList();

	callback();
};

exports.tearDown = function(callback) {

	delete require.cache.d3;
	callback();
};

exports.axis = function(test) {

	var chartElement = document.getElementById('chart');
	var yAxisElement = document.getElementById('y_axis');

	var graph = new Rickshaw.Graph({
		width: 900,
		height: 600,
		element: chartElement,
		series: [ { data: [ { x: 4, y: 32 }, { x: 16, y: 100 } ] } ]
	});

	var yAxis = new Rickshaw.Graph.Axis.Y({
		element: yAxisElement,
		graph: graph,
		orientation: 'left'
	});

	yAxis.render();

	var ticks = d3.select(chartElement).selectAll('.y_grid .tick')

	test.equal(ticks[0].length, 11, "we have some ticks");
	test.equal(ticks[0][0].getAttribute('data-y-value'), '0');

	test.equal(yAxis.width, 40, "width is set from axis element");
	test.equal(yAxis.height, 600, "height is set from chart element");

	yAxis.setSize({
		width: 20
	});

	test.equal(yAxis.width, 20, "setSize causes changes");
	test.equal(yAxis.height, 600, "setSize doent change values which are not passed");

	test.done();
};
