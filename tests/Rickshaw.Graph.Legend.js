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

exports.rendersLegend = function(test) {

	var el = document.createElement("div");
	var legendEl = document.createElement("div");

	var graph = new Rickshaw.Graph({
		element: el,
		width: 960,
		height: 500,
		renderer: 'stack',
		series: [
			{
				name: 'foo',
				data: [
					{ x: 4, y: 32 }
				]
			},
			{
				name: 'bar',
				data: [
					{ x: 4, y: 32 }
				]
			}
		]
	});

	var legend = new Rickshaw.Graph.Legend({
		graph: graph,
		element: legendEl
	});

	graph.render();

	var items = legendEl.getElementsByTagName('li')
	test.equal(items.length, 2, "legend count")
	test.equal(items[1].getElementsByClassName('label')[0].innerHTML, "foo")
	test.equal(items[0].getElementsByClassName('label')[0].innerHTML, "bar")

	test.done();

};

