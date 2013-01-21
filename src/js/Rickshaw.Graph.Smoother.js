Rickshaw.namespace('Rickshaw.Graph.Smoother');

Rickshaw.Graph.Smoother = function(args) {

	this.graph = args.graph;
	this.element = args.element;

	var self = this;

	this.aggregationScale = 1;

	if (this.element) {

		$( function() {
			$(self.element).slider( {
				min: 1,
				max: 100,
				slide: function( event, ui ) {
					self.setScale(ui.value);
					self.graph.update();
				}
			} );
		} );
	}

	self.graph.stackData.hooks.data.push( {
		name: 'smoother',
		orderPosition: 50,
		f: function(data) {

			if (self.aggregationScale == 1) return data;

			var aggregatedData = [];

			data.forEach( function(seriesData) {

				var aggregatedSeriesData = [];

				while (seriesData.length) {

					var avgX = 0, avgY = 0;
					var slice = seriesData.splice(0, self.aggregationScale);

					slice.forEach( function(d) {
						avgX += d.x / slice.length;
						avgY += d.y / slice.length;
					} );

					aggregatedSeriesData.push( { x: avgX, y: avgY } );
				}

				aggregatedData.push(aggregatedSeriesData);
			} );

			return aggregatedData;
		}
	} );

	this.setScale = function(scale) {

		if (scale < 1) {
			throw "scale out of range: " + scale;
		}

		this.aggregationScale = scale;
		this.graph.update();
	}
};

