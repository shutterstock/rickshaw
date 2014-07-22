Rickshaw.namespace('Rickshaw.Graph.Behavior.Series.Highlight');

Rickshaw.Graph.Behavior.Series.Highlight = function(args) {

	this.graph = args.graph;
	this.legend = args.legend;

	var self = this;

	var colorSafe = {};
	var activeLine = null;

	var disabledColor = args.disabledColor || function(seriesColor) {
		return d3.interpolateRgb(seriesColor, d3.rgb('#d8d8d8'))(0.8).toString();
	};

	this.addHighlightEvents = function (l) {

		l.element.addEventListener( 'mouseover', function(e) {

			if (activeLine) return;
			else activeLine = l;

			self.legend.lines.forEach( function(line) {

				if (l === line) {

					// if we're not in a stacked renderer bring active line to the top
					if (self.graph.renderer.unstack)
						line.series.forEach(function (series) {
							if (series.renderer ? series.renderer.unstack : true) {

								var seriesIndex = self.graph.series.indexOf(series);
								line.originalIndex = seriesIndex;

								series = self.graph.series.splice(seriesIndex, 1)[0];
								self.graph.series.push(series);
							}
						});
					return;
				}

				// backup and change the series' colors
				line.series.forEach(function (series, s) {
					if (!(series.name in colorSafe))
						colorSafe[series.name] = [];
					colorSafe[series.name][s] = colorSafe[series.name][s] || series.color;
					series.color = disabledColor(series.color);
				});

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

				// restore the series' colors
				line.series.forEach(function (series, s) {
					if (colorSafe[series.name] && colorSafe[series.name][s]) {
						series.color = colorSafe[series.name][s];
					}
				});
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
