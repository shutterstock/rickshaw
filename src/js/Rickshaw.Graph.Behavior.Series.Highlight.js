Rickshaw.namespace('Rickshaw.Graph.Behavior.Series.Highlight');

Rickshaw.Graph.Behavior.Series.Highlight = function(args) {

	this.graph = args.graph;
	this.legend = args.legend;

	var self = this;

	var colorSafe = {};

	this.addHighlightEvents = function (l) {
		l.element.addEventListener( 'mouseover', function(e) {

			self.legend.lines.forEach( function(line, index) {
				if (l === line) {
					if (index > 0 && ['area', 'bar'].indexOf(self.graph.renderer.name) == -1) {
						// unless the renderer is 'area' or 'bar', reorder the
						// series to bring the highlighted series to the front
						var seriesIndex = self.graph.series.length - index - 1;
						var series = self.graph.series.splice(seriesIndex, 1)[0];
						line.originalIndex = seriesIndex;
						self.graph.series.push(series);
					}
					return;
				}
				colorSafe[line.series.name] = colorSafe[line.series.name] || line.series.color;
				line.series.color = d3.interpolateRgb(line.series.color, d3.rgb('#d8d8d8'))(0.8).toString();
			} );

			self.graph.update();

		}, false );

		l.element.addEventListener( 'mouseout', function(e) {

			self.legend.lines.forEach( function(line) {
				if (l === line && line.hasOwnProperty('originalIndex')) {
					// return reordered series to its original place
					var series = self.graph.series.pop();
					self.graph.series.splice(line.originalIndex, 0, series);
					delete line['originalIndex'];
				}
				if (colorSafe[line.series.name]) {
					line.series.color = colorSafe[line.series.name];
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
