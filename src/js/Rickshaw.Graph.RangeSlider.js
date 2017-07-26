Rickshaw.namespace('Rickshaw.Graph.RangeSlider');

Rickshaw.Graph.RangeSlider = Rickshaw.Class.create({

	initialize: function(args) {

		var $ = jQuery;
		var self = this;
		var element = this.element = args.element;
		var graphs = this.graphs = args.graphs;
		if (!graphs) {
			graphs = this.graph = args.graph;
		}
		if (graphs.constructor !== Array) {
			graphs = [graphs];
		}
		this.graph = graphs[0];

		this.slideCallbacks = [];

		this.build();

		for (var i = 0; i < graphs.length; i++) {
			graphs[i].onUpdate(function() {
				self.update();
			}.bind(self));

			(function(idx){
				graphs[idx].onConfigure(function() {
					$(this.element)[0].style.width = graphs[idx].width + 'px';
				}.bind(self));
			})(i);
		}

	},

	build: function() {

		var domain;
		var element = this.element;
		var $ = jQuery;
		var self = this;
		var graphs = this.graphs || this.graph;

		if (graphs.constructor !== Array) {
			graphs = [graphs];
		}

		// base the slider's min/max on the first graph
		this.graph = graphs[0];
		domain = graphs[0].dataDomain();

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
					self.slideStarted({ event: event, ui: ui });
				},
				stop: function(event, ui) {
					self.slideFinished({ event: event, ui: ui });
				},
				slide: function(event, ui) {
					if (!self.slideShouldUpdate(event, ui))
						return;

					if (ui.values[1] <= ui.values[0]) return;

					for (var i = 0; i < graphs.length; i++) {
						self.processSlideChange({
							event: event,
							ui: ui,
							graph: graphs[i]
						});
					}
				}
			} );
		} );

		graphs[0].onConfigure(function() {
			$(this.element)[0].style.width = graphs[0].width + 'px';
		}.bind(this));

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
	},

	processSlideChange: function(args) {
		var event = args.event;
		var ui = args.ui;
		var graph = args.graph;

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
	slideShouldUpdate: function() {
		return true;
	},

	slideStarted: function() {
		return;
	},

	slideFinished: function() {
		return;
	}
});

