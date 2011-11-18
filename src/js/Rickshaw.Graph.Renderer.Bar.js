Rickshaw.namespace('Rickshaw.Graph.Renderer.Bar');

Rickshaw.Graph.Renderer.Bar = function(args) {

		var graph = this.graph = args.graph;
		var self = this;

		this.name = 'bar';
		this.gapSize = args.gapSize || 0.05;

		this.domain = function() {

			var stackedData = graph.stackedData || graph.stackData();

			var topSeriesData = stackedData.slice(-1).shift();

			var xMin = stackedData[0][0].x;
			var xMax = stackedData[0][ stackedData[0].length - 1 ].x;

			var yMin = 0;
			var yMax = d3.max( topSeriesData, function(d) { return d.y + d.y0 } );

			this._barWidth = null;

			return { x: [xMin, xMax], y: [yMin, yMax] };
		}

		this.barWidth = function() {

			if (this._barWidth) return this._barWidth;

			var stackedData = graph.stackedData || graph.stackData();
			var data = stackedData.slice(-1).shift();

			var intervalCounts = {};

			for (var i = 0; i < data.length - 1; i++) {
				var interval = data[i + 1].x - data[i].x;
				intervalCounts[interval] = intervalCounts[interval] || 0;
				intervalCounts[interval]++;
			}

			var frequentInterval = { count: 0 };

			d3.keys(intervalCounts).forEach( function(i) {
				if (frequentInterval.count < intervalCounts[i]) {

					frequentInterval = {
						count: intervalCounts[i],
						magnitude: i
					};
				}
			} );

			this._barWidth = this.graph.x(data[0].x + frequentInterval.magnitude * (1 - this.gapSize));
			return this._barWidth;
		}

		this.render = function() {

			graph.vis.selectAll('*').remove();

			var barWidth = this.barWidth();

			graph.series.forEach( function(series) {

				if (series.disabled) return;

				var nodes = graph.vis.selectAll("path")
					.data(series.stack)
					.enter().append("svg:rect")
					.attr("x", function(d) { return graph.x(d.x) })
					.attr("y", function(d) { return graph.y(d.y0 + d.y) })
					.attr("width", barWidth)
					.attr("height", function(d) { return graph.y.magnitude(d.y) });

				Array.prototype.forEach.call(nodes[0], function(n) {
					n.setAttribute('fill', series.color);
				} );

			} );
		}

		this._styleSeries = function(series) {
			if (!series.path) return;
			series.path.setAttribute('fill', series.color);
			series.path.setAttribute('stroke-width', 2);
			series.path.setAttribute('class', series.className);
		}
}
