Rickshaw.namespace('Rickshaw.Graph.Behavior.Series.Highlight');

Rickshaw.Graph.Behavior.Series.Highlight = function(args) {

	this.graph = args.graph;
	this.legend = args.legend;

	var self = this;

	var propertiesSafe = {};
	var activeLine = null;

	var disabledColor = args.disabledColor || function(seriesColor) {
		return d3.interpolateRgb(seriesColor, d3.rgb('#d8d8d8'))(0.8).toString();
	};

	var transformFn = args.transform || function(isActive, series) {
		var newProperties = {};
		if (!isActive) {
			// backwards compatibility
			newProperties.color = disabledColor(series.color);
		}
		return newProperties;
	};


	this.addHighlightEvents = function (l) {

		l.element.addEventListener( 'mouseover', function(e) {

			if (activeLine) return;
			else activeLine = l;

			self.legend.lines.forEach( function(line) {
				var newProperties;
				var isActive = false;

				if (l === line) {
					isActive = true;

					// if we're not in a stacked renderer bring active line to the top
					if (self.graph.renderer.unstack && (line.series.renderer ? line.series.renderer.unstack : true)) {

						var seriesIndex = self.graph.series.indexOf(line.series);
						line.originalIndex = seriesIndex;

						var series = self.graph.series.splice(seriesIndex, 1)[0];
						self.graph.series.push(series);
					}
				}

				newProperties = transformFn(isActive, line.series);

				propertiesSafe[line.series.name] = propertiesSafe[line.series.name] || {
					color   : line.series.color,
					stroke  : line.series.stroke
				};

				if (newProperties.color) {
					line.series.color = newProperties.color;
				}
				if (newProperties.stroke) {
					line.series.stroke = newProperties.stroke;
				}

			} );

			self.graph.update();

		}, false );

		l.element.addEventListener( 'mouseout', function(e) {

			if (!activeLine) return;
			else activeLine = null;

			self.legend.lines.forEach( function(line) {

				// return reordered series to its original place
				if (l === line && line.hasOwnProperty('originalIndex')) {

					var series = self.graph.series.pop();
					self.graph.series.splice(line.originalIndex, 0, series);
					delete line.originalIndex;
				}

				var lineProperties = propertiesSafe[line.series.name];
				if (lineProperties) {
					line.series.color  = lineProperties.color;
					line.series.stroke = lineProperties.stroke;
				}
			} );

			self.graph.update();

		}, false );
	};

	if (this.legend) {
		this.legend.lines.forEach( function(l) {
			self.addHighlightEvents(l);
		} );
	}

};
