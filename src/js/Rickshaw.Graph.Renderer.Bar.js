Rickshaw.namespace('Rickshaw.Graph.Renderer.Bar');

Rickshaw.Graph.Renderer.Bar = Rickshaw.Class.create( Rickshaw.Graph.Renderer, {

	name: 'bar',

	defaults: function($super) {

		var defaults = Rickshaw.extend( $super(), {
			gapSize: 0.05,
			unstack: false
		} );

		delete defaults.tension;
		return defaults;
	},

	initialize: function($super, args) {
		args = args || {};
		this.gapSize = args.gapSize || this.gapSize;
		$super(args);
	},

	domain: function($super) {

		var domain = $super();

		var frequentInterval = this._frequentInterval();
		domain.x[1] += parseInt(frequentInterval.magnitude);

		return domain;
	},

	barWidth: function() {

		var stackedData = this.graph.stackedData || this.graph.stackData();
		var data = stackedData.slice(-1).shift();

		var frequentInterval = this._frequentInterval();
		var barWidth = this.graph.x(data[0].x + frequentInterval.magnitude * (1 - this.gapSize)); 

		return barWidth;
	},

	render: function() {

		var graph = this.graph;

		graph.vis.selectAll('*').remove();

		var barWidth = this.barWidth();
		var barXOffset = 0;

		var activeSeriesCount = graph.series.filter( function(s) { return !s.disabled; } ).length;
		var seriesBarWidth = this.unstack ? barWidth / activeSeriesCount : barWidth;

		var transform = function(d) {
			// add a matrix transform for negative values
			var matrix = [ 1, 0, 0, (d.y < 0 ? -1 : 1), 0, (d.y < 0 ? graph.y.magnitude(Math.abs(d.y)) * 2 : 0) ];
			return "matrix(" + matrix.join(',') + ")";
		};

		graph.series.forEach( function(series) {

			if (series.disabled) return;

			var nodes = graph.vis.selectAll("path")
				.data(series.stack)
				.enter().append("svg:rect")
				.attr("x", function(d) { return graph.x(d.x) + barXOffset })
				.attr("y", function(d) { return (graph.y(d.y0 + Math.abs(d.y))) * (d.y < 0 ? -1 : 1 ) })
				.attr("width", seriesBarWidth)
				.attr("height", function(d) { return graph.y.magnitude(Math.abs(d.y)) })
				.attr("transform", transform);

			Array.prototype.forEach.call(nodes[0], function(n) {
				n.setAttribute('fill', series.color);
			} );

			if (this.unstack) barXOffset += seriesBarWidth;

		}, this );
	},

	_frequentInterval: function() {

		var stackedData = this.graph.stackedData || this.graph.stackData();
		var data = stackedData.slice(-1).shift();

		var intervalCounts = {};

		for (var i = 0; i < data.length - 1; i++) {
			var interval = data[i + 1].x - data[i].x;
			intervalCounts[interval] = intervalCounts[interval] || 0;
			intervalCounts[interval]++;
		}

		var frequentInterval = { count: 0 };

		Rickshaw.keys(intervalCounts).forEach( function(i) {
			if (frequentInterval.count < intervalCounts[i]) {

				frequentInterval = {
					count: intervalCounts[i],
					magnitude: i
				};
			}
		} );

		this._frequentInterval = function() { return frequentInterval };

		return frequentInterval;
	}
} );

