Rickshaw.namespace('Rickshaw.Graph.Renderer.ScatterPlot');

Rickshaw.Graph.Renderer.ScatterPlot = Rickshaw.Class.create( Rickshaw.Graph.Renderer, {

	name: 'scatterplot',
	unstack: true,
	fill: true,
	stroke: false,
	padding: { top: 0.025, right: 0.025, bottom: 0, left: 0.025 },

	initialize: function($super, args) {
		$super(args);
		this.dotSize = args.dotSize || 4;
	},

	render: function() {

		var graph = this.graph;

		graph.vis.selectAll('*').remove();

		graph.series.forEach( function(series) {

			if (series.disabled) return;

			var nodes = graph.vis.selectAll("path")
				.data(series.stack)
				.enter().append("svg:circle")
				.attr("cx", function(d) { return graph.x(d.x) })
				.attr("cy", function(d) { return graph.y(d.y) })
				.attr("r", this.dotSize);

			Array.prototype.forEach.call(nodes[0], function(n) {
				n.setAttribute('fill', series.color);
			} );

		}, this );
	}
} );
