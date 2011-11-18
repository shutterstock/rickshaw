Rickshaw.namespace('Rickshaw.Graph.Renderer.Line');

Rickshaw.Graph.Renderer.Line = function(args) {

		var graph = this.graph = args.graph;
		var self = this;

		this.name = 'line';
		this.unstack = true;

		graph.unstacker = graph.unstacker || new Rickshaw.Graph.Unstacker( { graph: graph } );

		this.seriesPathFactory = function() { 

			return d3.svg.line()
				.x( function(d) { return graph.x(d.x) } )
				.y( function(d) { return graph.y(d.y) } )
				.interpolate(this.graph.interpolation).tension(0.8);
		}

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

			var yMin = 0;
			var yMax = d3.max( values );

			return { x: [xMin, xMax], y: [yMin, yMax] };
		}

		this.render = function() {

			graph.vis.selectAll('*').remove();

			var nodes = this.graph.vis.selectAll("path")
				.data(this.graph.stackedData)
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
			series.path.setAttribute('fill', 'none');
			series.path.setAttribute('stroke', series.color);
			series.path.setAttribute('stroke-width', 2);
		}
}

