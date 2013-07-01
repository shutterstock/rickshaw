Rickshaw.namespace('Rickshaw.Graph.Transform');

Rickshaw.Graph.Transform = Rickshaw.Class.create({

	initialize: function(args) {

		this.graph = args.graph;
		this.element = args.element;

		// window size of the transformation
		this.windowSize = args.windowSize || 1;

		this.build();

		this.graph.stackData.hooks.data.push( {
			name: args.name || 'transform',
			orderPosition: 50,
			f: this.transformer.bind(this)
		} );
	},

	build: function() {
		// implement in subclass
	},

	setWindowSize: function(windowSize) {

		if (windowSize < 1) {
			throw "window size less than 1: " + windowSize;
		}

		this.windowSize = windowSize;
		this.graph.update();
	},

	transformer: function(data) {

		var transformedSeries = [];

		data.forEach( function(seriesData) {

			var transformedSeriesData = [];

			if (seriesData.length === 0) {
				transformedSeries.push(transformedSeriesData);
				return;
			}

			var buffer = seriesData.splice(0, this.windowSize);
			var position = 0;

			// transform the initial buffer
			var transformedWindow = this.transformWindow(buffer, position, seriesData.length);

			// increment position
			position += buffer.length;

			transformedSeriesData.push.apply(transformedSeriesData, transformedWindow);

			while (seriesData.length) {
				// remove front
				buffer.shift();

				// append end
				buffer.push(seriesData.shift());

				// transform window
				transformedWindow = this.transformWindow(buffer, position++, seriesData.length);
				transformedSeriesData.push.apply(transformedSeriesData, transformedWindow);
			}

			transformedSeries.push(transformedSeriesData);

		}.bind(this) );

		return transformedSeries;
	},

	transformWindow: function(buffer, position, remaining) {
		// implement in subclass
		return [];
	}
});

