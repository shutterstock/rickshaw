Rickshaw.namespace('Rickshaw.Graph.Behavior.Series.Highlight');

Rickshaw.Graph.Behavior.Series.Highlight = Rickshaw.Class.create({

	initialize: function(args) {

		this.graph = args.graph;
		this.legend = args.legend;

		this._colorSafe = {};
		this._activeLine = null;

		this.graph.onSeriesChange(function() {
			this.addListeners();

		}.bind(this));

		this.addListeners();
	},

	addListeners: function() {

		if (this.legend) {
			this.legend.lines.forEach(function(l) {
				this.addHighlightEvents(l);

			}.bind(this));
		}
	},

	addHighlightEvents: function(l) {

		if (l._hasHighlightEvents) return;

		l.element.addEventListener('mouseover', function(e) {

			if (this._activeLine) return;
			else this._activeLine = l;

			this.legend.lines.forEach(function(line, index) {

				if (l === line) {

					// if we're not in a stacked renderer bring active line to the top
					if (index > 0 && this.graph.renderer.unstack) {

						var seriesIndex = this.graph.series.length - index - 1;
						line.originalIndex = seriesIndex;

						var series = this.graph.series.splice(seriesIndex, 1)[0];
						this.graph.series.push(series);
					}
					return;
				}

				this._colorSafe[line.series.name] = this._colorSafe[line.series.name] || line.series.color;
				line.series.color = d3.interpolateRgb(line.series.color, d3.rgb('#d8d8d8'))(0.8).toString();

			}.bind(this));

			this.graph.update();

		}.bind(this), false );

		l.element.addEventListener('mouseout', function(e) {

			if (!this._activeLine) return;
			else this._activeLine = null;

			this.legend.lines.forEach(function(line) {

				// return reordered series to its original place
				if (l === line && line.hasOwnProperty('originalIndex')) {

					var series = this.graph.series.pop();
					this.graph.series.splice(line.originalIndex, 0, series);
					delete line.originalIndex;
				}

				if (this._colorSafe[line.series.name]) {
					line.series.color = this._colorSafe[line.series.name];
				}

			}.bind(this));

			this.graph.update();

		}.bind(this), false);

		l._hasHighlightEvents = true;
	}
});
