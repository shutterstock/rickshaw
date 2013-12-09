var Rickshaw = require("../rickshaw");

exports["should add the series className to all scatterplot points"] = function(test) {
	var el = document.createElement("div");
	var graph = new Rickshaw.Graph({
		element: el,
		stroke: true,
		width: 10,
		height: 10,
		renderer: 'scatterplot',
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
	graph.render()
	
	var path = graph.vis.selectAll('circle.fnord')
	test.equals(5, path.size())
	test.done()
}
