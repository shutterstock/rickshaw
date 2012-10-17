var Rickshaw = require("../rickshaw");

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

	test.done();
};

