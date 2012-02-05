Rickshaw.namespace('Rickshaw.Graph.Renderer.ScatterPlot');

Rickshaw.Graph.Renderer.ScatterPlot = function(args) {

		var graph = this.graph = args.graph;
		var self = this;

		this.name = 'scatterplot';
		this.unstack = true;
		this.dotSize = args.dotSize || 4;

		this.xBerth = 1.0125;
		this.yBerth = 1.0125;

		graph.unstacker = graph.unstacker || new Rickshaw.Graph.Unstacker( { graph: graph } );

		this.domain = function() {

			var values = [];
			var stackedData = graph.stackedData || graph.stackData();
	
			stackedData.forEach( function(series) {
				series.forEach( function(d) {
					values.push( d.y )
				} );
			} );

			var xMin = stackedData[0][0].x;
			var xMax = stackedData[0][ stackedData[0].length - 1 ].x;

			xMin -= (xMax - xMin) * (this.xBerth - 1);
			xMax += (xMax - xMin) * (this.xBerth - 1);

			var yMin = 0;
			var yMax = d3.max( values ) * this.yBerth;

			return { x: [xMin, xMax], y: [yMin, yMax] };
		}

		this.render = function() {

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

		this._styleSeries = function(series) {
			if (!series.path) return;
			series.path.setAttribute('fill', series.color);
			series.path.setAttribute('stroke-width', 2);
			series.path.setAttribute('class', series.className);
		}
}
