Rickshaw.namespace('Rickshaw.Graph.Legend');

Rickshaw.Graph.Legend = function(args) {

	var element = this.element = args.element;
	var graph = this.graph = args.graph;

	var self = this;

	element.classList.add('rickshaw_legend');

	this.list = document.createElement('ul');
	element.appendChild(this.list);

	this.prepareSeries = function(unpreparedSeries) {
		var preparedSeries = unpreparedSeries.map(function(s) {
			return s;
		});

		if (!args.naturalOrder) {
			preparedSeries = preparedSeries.reverse();
		}

		return preparedSeries;
	};

	this.lines = [];

	this.addLine = function(series) {
		var lineElement = document.createElement('li');
		lineElement.series = series;

		var lineData = {
			element: lineElement,
			series: series
		};

		lineData.swatch = document.createElement('div');
		lineElement.appendChild(lineData.swatch);

		lineData.label = document.createElement('span');
		lineElement.appendChild(lineData.label);		

		this.updateLineBehavior(lineData);

		if (self.toggler) {
			self.toggler.addAnchor(lineData);
			self.toggler.updateBehaviour();
		}
		if (self.highlighter) {
			self.highlighter.addHighlightEvents(lineData);
		}

		return lineData;
	};

	this.updateLineBehavior = function(lineData) {
		if (lineData.series.noLegend) {
			lineData.element.style.display = 'none';
		}

		lineData.element.className = 'line';
		if (lineData.series.disabled) {
			lineData.element.className += ' disabled';
		}

		lineData.swatch.className = 'swatch';
		lineData.swatch.style.backgroundColor = lineData.series.color;

		lineData.label.className = 'label';
		lineData.label.innerHTML = lineData.series.name;
	};

	this.updateLines = function() {
		var newSetOfLines = [];
		var seriesArray = this.prepareSeries(graph.series);

		for (var i = 0; i < seriesArray.length; i++) {
			var series = seriesArray[i];
			var existingLine = null;
			for (var j = self.lines.length - 1; j >= 0; j--) {
				if (self.lines[j].series === series) {
					existingLine = self.lines[j];
					break;
				}
			}

			if (existingLine !== null) {
				newSetOfLines.push(existingLine);
			} else {
				newSetOfLines.push(self.addLine(series));
			}
		}

		self.lines = newSetOfLines;

		self.list.innerHTML = '';
		self.lines.forEach(function (lineData) {
				self.list.appendChild(lineData.element);
		});
	};

	self.updateLines();

	graph.onUpdate(function() {
		self.updateLines();
	});
};