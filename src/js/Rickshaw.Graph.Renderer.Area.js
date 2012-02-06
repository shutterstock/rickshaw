Rickshaw.namespace('Rickshaw.Graph.Renderer.Area');

Rickshaw.Graph.Renderer.Area = function(args) {

	var graph = this.graph = args.graph;
	var self = this;

	this.tension = 0.8;
	this.strokeWidth = 2;
	this.yBerth = 1.025;

	this.name = 'area';

	this.unstack = false;
	graph.unstacker = graph.unstacker || new Rickshaw.Graph.Unstacker( { graph: graph } );

	this.seriesPathFactory = function() { 

		return d3.svg.area()
			.x( function(d) { return graph.x(d.x) } )
			.y0( function(d) { return graph.y(d.y0) } )
			.y1( function(d) { return graph.y(d.y + d.y0)} )
			.interpolate(this.graph.interpolation).tension(this.tension)
	}

	this.seriesLineFactory = function() { 

		return d3.svg.line()
			.x( function(d) { return graph.x(d.x) } )
			.y( function(d) { return graph.y(d.y + d.y0)} )
			.interpolate(this.graph.interpolation).tension(this.tension)
	}

	this.domain = function() {

		var values = [];
		var stackedData = graph.stackedData || graph.stackData();

		var topSeriesData = this.unstack ? stackedData : [ stackedData.slice(-1).shift() ];

		topSeriesData.forEach( function(series) {
			series.forEach( function(d) {
				values.push( d.y + d.y0 );
			} );
		} );

		var xMin = stackedData[0][0].x;
		var xMax = stackedData[0][ stackedData[0].length - 1 ].x;

		var yMin = 0;
		var yMax = d3.max( values ) * this.yBerth;

		return { x: [xMin, xMax], y: [yMin, yMax] };
	}

	this.render = function() {

		graph.vis.selectAll('*').remove();

		var nodes = graph.vis.selectAll("path")
			.data(graph.stackedData)
			.enter().insert("svg:g", 'g')

		nodes.append("svg:path")
			.attr("d", this.seriesPathFactory())
			.attr("class", 'area');

		if (this.graph.stroke) {
			nodes.append("svg:path")
				.attr("d", this.seriesLineFactory())
				.attr("class", 'line');
		}
		
		var i = 0;
		graph.series.forEach( function(series) {
			if (series.disabled) return;
			series.path = nodes[0][i++];
			self._styleSeries(series);
		} );
	}

	this._styleSeries = function(series) {

		if (!series.path) return;

		d3.select(series.path).select('.area')
			.attr('fill', series.color);

		if (this.graph.stroke) {
			d3.select(series.path).select('.line')
				.attr('fill', 'none')
				.attr('stroke', series.stroke || d3.interpolateRgb(series.color, 'black')(0.125))
				.attr('stroke-width', this.strokeWidth);
		}

		if (series.className) {
			series.path.setAttribute('class', series.className);
		}
	}
}
