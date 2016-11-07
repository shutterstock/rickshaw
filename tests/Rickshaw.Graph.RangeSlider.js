var d3 = require("d3");
global.jQuery = function(arg){
	return arg;
}

var graphs;

function createGraphs() {
	var graphs = [];
	// set up our data series with 50 random data points
	var seriesData = [ [], [], [] ];
	var random = new Rickshaw.Fixtures.RandomData(150);

	for (var i = 0; i < 150; i++) {
		random.addData(seriesData);
	}

	color = [ "#c05020", "#30c020","#6060c0"]
	names = ['New York','London','Tokyo']

	// Make all three graphs in a loop
	for (var i = 0; i < names.length; i++) {
		graph = new Rickshaw.Graph( {
			element: document.getElementById("chart_"+i),
			width: 800,
			height: 100,
			renderer: 'line',
			series: [{
				color: color[i],
				data: seriesData[i],
				name: names[i]
			}]
		});

		graph.render()
		graphs.push(graph)
	}

	return graphs;
}

exports.setUp = function(callback) {

	Rickshaw = require('../rickshaw');

	global.document = require("jsdom").jsdom("<html><head></head><body><div id='chart_0'></div><div id='chart_1'></div><div id='chart_2'><div id='slider'></div></div></body></html>");
	global.window = document.defaultView;

	new Rickshaw.Compat.ClassList();

	graphs = createGraphs();

	callback();
};

exports.tearDown = function(callback) {

	delete require.cache.d3;
	callback();
};

exports.basic = function(test) {
	var graphs = createGraphs();

	var slider = new Rickshaw.Graph.RangeSlider({
		element:  document.getElementById("slider"),
		graph: graphs[0]
	});

	test.ok(slider.graph, "slider supports multiple graphs");
	test.done();
};

exports.shared = function(test) {
	var slider = new Rickshaw.Graph.RangeSlider({
		element:  document.getElementById("slider"),
		graphs: graphs
	});

	test.ok(slider.graphs, "slider supports multiple graphs");
	test.ok(slider.graph === slider.graphs[0], "slider uses first graph as reference");
	test.done();
};


