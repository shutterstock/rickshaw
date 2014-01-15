var Rickshaw = require("../rickshaw");

exports['should determine domain from subrenderers'] = function(test) {

	// document comes from jsdom
	var el = document.createElement("div");
	
	Rickshaw.namespace('Rickshaw.Graph.Renderer.DomainSubrenderer');
	Rickshaw.Graph.Renderer.DomainSubrenderer = Rickshaw.Class.create( Rickshaw.Graph.Renderer, {
		name: 'domain',
		domain: function(data) {
			return {x: [-10, 20], y: [-15, 30]};
		}
	});
	
	var graph = new Rickshaw.Graph({
		element: el, width: 960, height: 500,
		padding: { top: 0, right: 0, bottom: 0, left: 0 },
		renderer: 'domain',
		series: [
			{
				color: 'steelblue',
				data: [
					{ x: 0, y: 40 },
					{ x: 1, y: 49 }
				]
			}
		]
	});
	test.deepEqual(graph.renderer.domain(), {x: [-10, 20], y: [-15, 30]});
	
	
	var graph = new Rickshaw.Graph({
		element: el, width: 960, height: 500,
		padding: { top: 0, right: 0, bottom: 0, left: 0 },
		renderer: 'multi',
		series: [
			{
				renderer: 'domain',
				data: [
					{ x: 0, y: 40 },
					{ x: 1, y: 49 }
				]
			}
		]
	});
	test.deepEqual(graph.renderer.domain(), {x: [-10, 20], y: [-15, 30]});
	
	test.done();
};

