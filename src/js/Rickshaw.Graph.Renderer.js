Rickshaw.namespace("Rickshaw.Graph.Renderer");

Rickshaw.Graph.Renderer = Rickshaw.Class.create( {
	
	initialize: function(args) {
		this.graph = args.graph;
		this.tension = args.tension || this.tension;
		this.configure(args);
	},

	seriesPathFactory: function() {
		//implement in subclass
	},

	seriesStrokeFactory: function() {
		// implement in subclass
	},

	defaults: function() {
		return {
			tension: 0.8,
			strokeWidth: 2,
			unstack: true,
			padding: { top: 0.01, right: 0, bottom: 0.01, left: 0 },
			stroke: false,
			fill: false
		};
	},

	domain: function(data) {

		var stackedData = data || this.graph.stackedData || this.graph.stackData();
		var firstPoint = stackedData[0][0];

		if (firstPoint === undefined) {
			return { x: [null, null], y: [null, null] };
		}

		var xMin = firstPoint.x;
		var xMax = firstPoint.x;

		var yMin = firstPoint.y + firstPoint.y0;
		var yMax = firstPoint.y + firstPoint.y0;

		stackedData.forEach( function(series) {

			series.forEach( function(d) {

				if (d.y == null) return;

				var y = d.y + d.y0;

				if (y < yMin) yMin = y;
				if (y > yMax) yMax = y;
			} );

			if (!series.length) return;

			if (series[0].x < xMin) xMin = series[0].x;
			if (series[series.length - 1].x > xMax) xMax = series[series.length - 1].x;
		} );

		xMin -= (xMax - xMin) * this.padding.left;
		xMax += (xMax - xMin) * this.padding.right;

		yMin = this.graph.min === 'auto' ? yMin : this.graph.min || 0;
		yMax = this.graph.max === undefined ? yMax : this.graph.max;

		if (this.graph.min === 'auto' || yMin < 0) {
			yMin -= (yMax - yMin) * this.padding.bottom;
		}

		if (this.graph.max === undefined) {
			yMax += (yMax - yMin) * this.padding.top;
		}

		return { x: [xMin, xMax], y: [yMin, yMax] };
	},

	render: function(args) {

		args = args || {};

		var graph = this.graph;
		var series = args.series || graph.series;

		var vis = args.vis || graph.vis;
		// REFACT: this should really happen via d3 enter()/ exit()
		vis.selectAll('*').remove();

		var data = series
			.filter(function(s) { return !s.disabled })
			.map(function(s) { return s.stack });
		
		var pathNodes = vis.selectAll('path.path')
			.data(data)
			.enter().append('svg:path')
				.classed('path', true)
				.attr("d", this.seriesPathFactory());
				
		var strokeNodes = null;
		if (this.stroke) {
			strokeNodes = vis.selectAll('path.stroke')
				.data(data)
				.enter().append("svg:path")
					.classed('stroke', true)
					.attr("d", this.seriesStrokeFactory());
		}
		
		// Enable later processing of the created dom nodes
		// REFACT: putting additional values into the series doesn't seem like a great idea just to allow _styleSeries() to do it's job.
		// Users can get access to the paths by specifying a custom class
		// and the Renderer could either store them on this.{path,strokePath}
		// or hand them in to _styleSeries() directly.
		series.forEach( function(series, index) {
			if (series.disabled) return;
			series.path = pathNodes[0][index];
			if (this.stroke) series.strokePath = strokeNodes[0][index];
			this._styleSeries(series);
		}, this );
	},

	_styleSeries: function(series) {

		var fill = this.fill ? series.color : 'none';
		var stroke = this.stroke ? series.color : 'none';

		series.path.setAttribute('fill', fill);
		series.path.setAttribute('stroke', stroke);
		series.path.setAttribute('stroke-width', this.strokeWidth);
		if (series.className) {
			d3.select(series.path).classed(series.className, true);
			if (series.strokePath) {
				d3.select(series.strokePath).classed(series.className, true);
			}
		}
	},

	configure: function(args) {

		args = args || {};

		Rickshaw.keys(this.defaults()).forEach( function(key) {

			if (!args.hasOwnProperty(key)) {
				this[key] = this[key] || this.graph[key] || this.defaults()[key];
				return;
			}

			if (typeof this.defaults()[key] == 'object') {

				Rickshaw.keys(this.defaults()[key]).forEach( function(k) {

					this[key][k] =
						args[key][k] !== undefined ? args[key][k] :
						this[key][k] !== undefined ? this[key][k] :
						this.defaults()[key][k];
				}, this );

			} else {
				this[key] =
					args[key] !== undefined ? args[key] :
					this[key] !== undefined ? this[key] :
					this.graph[key] !== undefined ? this.graph[key] :
					this.defaults()[key];
			}

		}, this );
	},

	setStrokeWidth: function(strokeWidth) {
		if (strokeWidth !== undefined) {
			this.strokeWidth = strokeWidth;
		}
	},

	setTension: function(tension) {
		if (tension !== undefined) {
			this.tension = tension;
		}
	}
} );
