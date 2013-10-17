Rickshaw.namespace('Rickshaw.Graph.Legend');

Rickshaw.Graph.Legend = Rickshaw.Class.create( {

	className: 'rickshaw_legend',

	initialize: function(args) {
		var self = this;
		this.element = args.element;
		this.graph = args.graph;

		this.element.classList.add(this.className);

		this.list = document.createElement('ul');
		this.element.appendChild(this.list);
		this.lines = [];

		var series = this.graph.series
			.map( function(s) { return s } );

		if (!args.naturalOrder) {
			series = series.reverse();
		}

		series.forEach( function(s) {
			self.addLine(s);
		} );

		this.graph.onUpdate( function() {} );
	},

	addLine: function (series) {
		var line = document.createElement('li');
		line.className = 'line';
		if (series.disabled) {
			line.className += ' disabled';
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

		line.series = series;

		if (series.noLegend) {
			line.style.display = 'none';
		}

		var _line = { element: line, series: series };
		if (this.shelving) {
			this.shelving.addAnchor(_line);
			this.shelving.updateBehaviour();
		}
		if (this.highlighter) {
			this.highlighter.addHighlightEvents(_line);
		}
		this.lines.push(_line);
	}
} );

