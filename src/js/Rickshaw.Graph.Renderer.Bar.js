Rickshaw.namespace('Rickshaw.Graph.Renderer.Bar');

Rickshaw.Graph.Renderer.Bar = function(args) {

		var graph = this.graph = args.graph;
		var self = this;

		this.name = 'bar';
		this.gapSize = args.gapSize || 0.05;

		this.unstack = false;

		graph.unstacker = graph.unstacker || new Rickshaw.Graph.Unstacker( { graph: graph } );

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
			var yMax = d3.max( values );

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

			var barsPerSlot = this.unstack ? this.graph.series.length : 1;
			var barWidth = this.barWidth();
			var barXOffset = 0;

			var activeSeriesCount = graph.series.filter( function(s) { return !s.disabled } ).length;
			var seriesBarWidth = this.unstack ? barWidth / activeSeriesCount : barWidth;

			graph.series.forEach( function(series) {

				if (series.disabled) return;

				var nodes = graph.vis.selectAll("path")
					.data(series.stack)
					.enter().append("svg:rect")
					.attr("x", function(d) { return graph.x(d.x) + barXOffset })
					.attr("y", function(d) { return graph.y(d.y0 + d.y) })
					.attr("width", seriesBarWidth)
					.attr("height", function(d) { return graph.y.magnitude(d.y) });

				Array.prototype.forEach.call(nodes[0], function(n) {
					n.setAttribute('fill', series.color);
				} );

				if (self.unstack) barXOffset += seriesBarWidth;

			} );
		}

		this._styleSeries = function(series) {
			if (!series.path) return;
			series.path.setAttribute('fill', series.color);
			series.path.setAttribute('stroke-width', 2);
			series.path.setAttribute('class', series.className);
		}
}
