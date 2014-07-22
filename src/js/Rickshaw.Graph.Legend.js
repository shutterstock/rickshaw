Rickshaw.namespace('Rickshaw.Graph.Legend');

Rickshaw.Graph.Legend = Rickshaw.Class.create( {

	className: 'rickshaw_legend',

	initialize: function(args) {
		this.element = args.element;
		this.graph = args.graph;
		this.naturalOrder = args.naturalOrder;

		this.element.classList.add(this.className);

		this.list = document.createElement('ul');
		this.element.appendChild(this.list);

		this.render();

		// we could bind this.render.bind(this) here
		// but triggering the re-render would lose the added
		// behavior of the series toggle
		this.graph.onUpdate( function() {} );
	},

	render: function() {
		var self = this;

		while ( this.list.firstChild ) {
			this.list.removeChild( this.list.firstChild );
		}
		this.lines = [];

		var series = this.graph.series
			.map( function(s) { return s } );

		if (!this.naturalOrder) {
			series = series.reverse();
		}

		series.forEach( function(s) {
			self.addLine(s);
		} );


	},

	addLine: function (series) {
		var line;
		for (var l = 0; l < this.list.children.length; l++) {
			line = this.list.children[l];
			// don't need to check for line.series[0].name's existence.  shouldn't have a line without it.
			if (line.series[0].name == series.name) {
				line.series.push(series);
				break;
			}
		}

		if (l == this.list.children.length) {
			line = document.createElement('li');
			line.className = 'line';
			if (series.disabled) {
				line.className += ' disabled';
			}
			if (series.className) {
				d3.select(line).classed(series.className, true);
			}
			var swatch = document.createElement('div');
			swatch.className = 'swatch';
			swatch.style.backgroundColor = series.color;

			line.appendChild(swatch);

			var label = document.createElement('span');
			label.className = 'label';
			label.innerHTML = series.name;

			line.appendChild(label);
			this.list.appendChild(line);

			line.series = [series];

			if (series.noLegend) {
				line.style.display = 'none';
			}
		}

		var _line;
		for (l = 0; l < this.lines.length; l++) {
			_line = this.lines[l];
			// don't need to check for _line.series[0].name's existence.  shouldn't have a _line without it.
			if (_line.series[0].name == series.name) {
				_line.series.push(series);
				break;
			}
		}

		if (l == this.lines.length) {
			series = [series];
			series.disabled = function () {return this[0].disabled};
			series.enable   = function () {this.forEach(function (s) {s.enable();})};
			series.disable  = function () {this.forEach(function (s) {s.disable();})};
			_line = {element: line, series: series};
			if (this.shelving) {
				this.shelving.addAnchor(_line);
				this.shelving.updateBehaviour();
			}
			if (this.highlighter) {
				this.highlighter.addHighlightEvents(_line);
			}
			this.lines.push(_line);
		}
		return line;
	}
} );

