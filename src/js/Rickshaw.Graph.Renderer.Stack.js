Rickshaw.namespace('Rickshaw.Graph.Renderer.Stack');

Rickshaw.Graph.Renderer.Stack = function(args) {

		var graph = this.graph = args.graph;
		var self = this;

		this.name = 'stack';

		this.seriesPathFactory = function() { 

			return d3.svg.area()
				.x( function(d) { return graph.x(d.x) } )
				.y0( function(d) { return graph.y(d.y0) } )
				.y1( function(d) { return graph.y(d.y + d.y0)} )
				.interpolate(this.graph.interpolation).tension(0.8);
		}

		this.domain = function() {

			var stackedData = graph.stackedData || graph.stackData();

			var topSeriesData = stackedData.slice(-1).shift();

			var xMin = stackedData[0][0].x;
			var xMax = stackedData[0][ stackedData[0].length - 1 ].x;

			var yMin = 0;
			var yMax = d3.max( topSeriesData, function(d) { return d.y + d.y0 } );

			return { x: [xMin, xMax], y: [yMin, yMax] };
		}

		this.render = function() {

			graph.vis.selectAll('*').remove();

			var nodes = graph.vis.selectAll("path")
				.data(graph.stackedData)
				.enter().append("svg:path")
				.attr("d", this.seriesPathFactory()); 

			var i = 0;
			graph.series.forEach( function(series) {
				if (series.disabled) return;
				series.path = nodes[0][i++];
				self._styleSeries(series);
			} );

		}

		this._styleSeries = function(series) {
			if (!series.path) return;
			series.path.setAttribute('fill', series.color);
			series.path.setAttribute('stroke-width', 2);
			series.path.setAttribute('class', series.className);
		}
}
