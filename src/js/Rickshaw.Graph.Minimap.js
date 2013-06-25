Rickshaw.namespace('Rickshaw.Graph.Minimap');

Rickshaw.Graph.Minimap = Rickshaw.Class.create({

	initialize: function(args) {
		if (!args.element) throw "Rickshaw.Graph needs a reference to an element";
		if (!args.graph && !args.graphs) throw "Rickshaw.Graph needs a reference to an graph or an array of graphs";

		this.element = args.element;

		if (args.graph === undefined) {
			this.graphs = args.graphs;
		} else {
			this.graphs = [args.graph];
		}

		this.defaults = {
			height: 50,
			width: 500
		};

		this.configure(args);
	},

	configure: function(args) {
		this.config = {};

		Rickshaw.keys(this.defaults).forEach(function(k) {
			this.config[k] = k in args ? args[k] : k in this.config ? this.config[k] : this.defaults[k];
		}, this);

		this.update();
	},

	update: function() {

		var mainElement = d3.select(this.element);

		var individualGraphHeight = this.config.height / this.graphs.length;
		var totalWidth = this.config.width;

		var minimap = this;

		var constructGraph = function(datum, index) {
			var domainScale = d3.scale.linear();
			domainScale.interpolate(d3.interpolateRound);
			domainScale.domain([0, totalWidth]);
			domainScale.range(datum.dataDomain());

			datum.minimapGraph = {
				container: minimap,
				height: individualGraphHeight,
				width: totalWidth,
				domainScale: domainScale
			};	

			// If anyone has an elegant way to do this without jQuery, please change...
			var minimapGraphConfiguration = jQuery.extend({}, datum.configuration);

			minimapGraphConfiguration.element = this;
			minimapGraphConfiguration.height = datum.minimapGraph.height;
			minimapGraphConfiguration.width = datum.minimapGraph.width;
			minimapGraphConfiguration.series = datum.series;

			datum.minimapGraph.graph = new Rickshaw.Graph(minimapGraphConfiguration);

			datum.onUpdate(function() {
				datum.minimapGraph.container.update();
			}.bind(this));

			datum.onConfigure(function(args) {
				datum.minimapGraph.graph.configure(args);
			}.bind(this));

			datum.minimapGraph.graph.render();
		};

		var graphBlock = mainElement.selectAll("div.minimap")
			.data(this.graphs);

		graphBlock.enter()
			.append("div")
			.classed("minimap", true)
			.each(constructGraph, this.config);

		graphBlock.exit()
			.remove();

		// Use the first graph as of the "master" for the frame state
		var masterGraph = this.graphs[0];
		var currentWindow = [masterGraph.window.xMin, masterGraph.window.xMax];
		var currentFrame = [0, this.config.width];
		for (var i = 0; i < currentWindow.length; i++) {
			if (currentWindow[i] !== undefined) {
				currentFrame[i] = masterGraph.minimapGraph.domainScale.invert(currentWindow[i]);
			}
			currentFrame[i] = Math.round(currentFrame[i]);
		}

		var framePath = "";
		framePath += " M 0 0";
		framePath += " h " + this.config.width;
		framePath += " v " + this.config.height;
		framePath += " h " + -this.config.width;
		framePath += " z";
		framePath += " M " + currentFrame[0] + " 0";
		framePath += " L " + currentFrame[1] + " 0";
		framePath += " L " + currentFrame[1] + " " + this.config.height;
		framePath += " L " + currentFrame[0] + " " + this.config.height;
		framePath += " z";

		var svgBlock = mainElement.selectAll("svg.minimap")
			.data([this.config]);

		svgBlock.enter()
			.append("svg")
			.classed("minimap", true);

		svgBlock
			.style("height", this.config.height)
			.style("width", this.config.width)
			.style("position", "relative")
			.style("top", -this.config.height);

		var pathBlock = svgBlock.selectAll("path")
			.data([this.config]);

		pathBlock.enter()
			.append("path");

		pathBlock
			.attr("d", framePath)
			.attr("fill", "white")
			.attr("fill-opacity", "0.5")
			.attr("fill-rule", "evenodd");

		this.graphs.forEach(function(datum) {
			datum.minimapGraph.graph.update();
		});

		console.log('GREAT SUCCESS');
	},
});