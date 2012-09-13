var fs = require('fs');

exports.svg = function(test) {

	var jsdom    = require("jsdom").jsdom;
	global.document = jsdom("<html><head></head><body></body></html>");
	global.window   = global.document.createWindow();

	var Rickshaw = require('../rickshaw');
	new Rickshaw.Compat.ClassList();

	var el = document.createElement("div");

	var graph = new Rickshaw.Graph({
	   element: el,
	   width: 960,
	   height: 500,
	   renderer: 'scatterplot',
	   series: [{
		color: 'steelblue',
		data: [
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
}
