Rickshaw.namespace('Rickshaw.Graph.RangeSlider');

Rickshaw.Graph.RangeSlider = Rickshaw.Class.create({

	initialize: function(args) {

		var element = this.element = args.element;
		var graph = this.graph = args.graph;

		this.slideCallbacks = [];

		this.build();

		graph.onUpdate( function() { this.update() }.bind(this) );
	},

	build: function() {

		var element = this.element;
		var graph = this.graph;
		var $ = jQuery;

		var domain = graph.dataDomain();
		var self = this;

		if (graph.constructor === Array) {
			$(function() {
				$(element).slider({

					range: true,
					min: graph[0].dataDomain()[0],
					max: graph[0].dataDomain()[1],
					values: [
						graph[0].dataDomain()[0],
						graph[0].dataDomain()[1]
					],
					slide: function(event, ui) {

						for (var i = 0; i < graph.length; i++) {
							graph[i].window.xMin = ui.values[0];
							graph[i].window.xMax = ui.values[1];
							graph[i].update();

							// if we're at an extreme, stick there
							if (graph[i].dataDomain()[0] == ui.values[0]) {
								graph[i].window.xMin = undefined;
							}
							if (graph[i].dataDomain()[1] == ui.values[1]) {
								graph[i].window.xMax = undefined;
							}
						}
					}
				});
			});

			element[0].style.width = graph.width + 'px';

			graph[0].onUpdate(function() {

				var values = $(element).slider('option', 'values');

				$(element).slider('option', 'min', graph[0].dataDomain()[0]);
				$(element).slider('option', 'max', graph[0].dataDomain()[1]);

				if (graph[0].window.xMin === undefined) {
					values[0] = graph[0].dataDomain()[0];
				}
				if (graph[0].window.xMax === undefined) {
					values[1] = graph[0].dataDomain()[1];
				}

				$(element).slider('option', 'values', values);

			});
		} else {
			$(function() {
				$(element).slider({
					range: true,
					min: domain[0],
					max: domain[1],
					values: [
						domain[0],
						domain[1]
					],
					slide: function(event, ui) {

						if (ui.values[1] <= ui.values[0]) return;

						graph.window.xMin = ui.values[0];
						graph.window.xMax = ui.values[1];
						graph.update();

						var domain = graph.dataDomain();

						// if we're at an extreme, stick there
						if (domain[0] == ui.values[0]) {
							graph.window.xMin = undefined;
						}

						if (domain[1] == ui.values[1]) {
							graph.window.xMax = undefined;
						}

						self.slideCallbacks.forEach(function(callback) {
							callback(graph, graph.window.xMin, graph.window.xMax);
						});
					}
				});
			});
		}

		$(element)[0].style.width = graph.width + 'px';

	},

	update: function() {

		var element = this.element;
		var graph = this.graph;
		var $ = jQuery;

		var values = $(element).slider('option', 'values');

		var domain = graph.dataDomain();

		$(element).slider('option', 'min', domain[0]);
		$(element).slider('option', 'max', domain[1]);

		if (graph.window.xMin == null) {
			values[0] = domain[0];
		}
		if (graph.window.xMax == null) {
			values[1] = domain[1];
		}

		$(element).slider('option', 'values', values);
	},

	onSlide: function(callback) {
		this.slideCallbacks.push(callback);
	}
});

