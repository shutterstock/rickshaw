Rickshaw.namespace('Rickshaw.Graph.Legend');

Rickshaw.Graph.Legend = Rickshaw.Class.create({

	initialize: function(args) {

		this.element = args.element;
		this.graph = args.graph;
		this.naturalOrder = args.naturalOrder;

		this.element.classList.add('rickshaw_legend');
		this.list = document.createElement('ul');
		this.element.appendChild(this.list);

		this.lines = [];
		this.updateCallbacks = [];

		this.populate();

		this.graph.onSeriesChange(function() {
			this.refresh();

		}.bind(this));
	},

	clear: function() {
		this.list.innerHTML = '';
		this.lines = [];
	},

	populate: function() {

		var series = this.graph.series
			.map( function(s) { return s } );

		if (!this.naturalOrder) {
			series = series.reverse();
		}

		series.forEach(function(s) {
			this.addLine(s);

		}.bind(this));
	},

	refresh: function() {
		this.clear();
		this.populate();
	},

	onUpdate: function(callback) {
		this.updateCallbacks.push(callback);
	},

	addLine: function(series) {

		console.log('addline', series.name);

		var line = document.createElement('li');
		line.className = 'line';

		if (series.disabled) {
			line.classList.add('disabled');
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
});
