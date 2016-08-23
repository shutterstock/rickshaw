Rickshaw.namespace('Rickshaw.Graph.RangeSlider');

Rickshaw.Graph.RangeSlider = Rickshaw.Class.create({

	initialize: function(args) {

		var element = this.element = args.element;
		var graph = this.graph = args.graph;

		this.slideCallbacks = [];

		this.build();

		if( graph.constructor === Array ) {
			for( var i=0; i<graph.length; i++ ) {
				graph[i].onUpdate( function() { this.update() }.bind(this) );
				graph[i].onConfigure( function() { this.configure() }.bind(this) );
			}
		} else {
			graph.onUpdate( function() { this.update() }.bind(this) );
			graph.onConfigure( function() { this.configure() }.bind(this) );
		}

	},

	build: function() {

		var element = this.element;
		var graph = this.graph;
		var $ = jQuery;
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
					start: function(event, ui) {
						self.slideStarted(event, ui);
					},
					stop: function(event, ui) {
						self.slideFinished(event, ui);
					},
					slide: function(event, ui) {

						if (!self.slideShouldUpdate(event, ui))
							return;

						if (ui.values[1] <= ui.values[0]) return;
						for (var i = 0; i < graph.length; i++) {
							self.processSlideChange(event, ui, graph[i]);
						}
					}
				});
			});

			element[0].style.width = graph[0].width + 'px';

		} else {

			var domain = graph.dataDomain();
			$(function() {
				$(element).slider({
					range: true,
					min: domain[0],
					max: domain[1],
					values: [
						domain[0],
						domain[1]
					],
					start: function(event, ui) {
						self.slideStarted(event, ui);
					},
					stop: function(event, ui) {
						self.slideFinished(event, ui);
					},
					slide: function(event, ui) {

						if (!self.slideShouldUpdate(event, ui))
							return;

						if (ui.values[1] <= ui.values[0]) return;

						self.processSlideChange(event, ui, graph);
					}
				});
			});

			$(element)[0].style.width = graph.width + 'px';
		}
	},

	configure: function() {
		var element = this.element;
		var graph = this.graph;
		var $ = jQuery;

		$(element)[0].style.width = graph.width + 'px';
	},

	update: function() {

		var element = this.element;
		var graph = this.graph;
		var $ = jQuery;

		var values = $(element).slider('option', 'values');

		if( graph.constructor === Array ) {
			graph = graph[0];
		}

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
	},

	processSlideChange: function(event, ui, graph) {

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

		this.slideCallbacks.forEach(function(callback) {
			callback(graph, graph.window.xMin, graph.window.xMax);
		});

	},

	// allows the slide updates to bail out if sliding is not permitted
	slideShouldUpdate: function(event, ui) {
		return true;
	},

	slideStarted: function(event, ui) {
		return;
	},

	slideFinished: function(event, ui) {
		return;
	}
});

