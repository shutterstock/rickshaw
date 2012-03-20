Rickshaw.namespace('Rickshaw.Graph.Behavior.Series.Highlight');

Rickshaw.Graph.Behavior.Series.Highlight = function(args) {

	this.graph = args.graph;
	this.legend = args.legend;

	var self = this;

	var colorSafe = {};

	this.addHighlightEvents = function (l) {
		l.element.addEventListener( 'mouseover', function(e) {

			self.legend.lines.forEach( function(line) {
				if (l === line) return;
				colorSafe[line.series.name] = colorSafe[line.series.name] || line.series.color;
				line.series.color = d3.interpolateRgb(line.series.color, d3.rgb('#d8d8d8'))(0.8).toString();
			} );

			self.graph.update();

		}, false );

		l.element.addEventListener( 'mouseout', function(e) {

			self.legend.lines.forEach( function(line) {
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
