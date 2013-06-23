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

		var constructGraph = function(datum, index) {
			// If anyone has an elegant way to do this without jQuery, please change...
			var minimapGraphConfiguration = jQuery.extend({}, datum.graph.configuration);

			minimapGraphConfiguration.element = this;
			minimapGraphConfiguration.height = datum.height;
			minimapGraphConfiguration.width = datum.width;
			minimapGraphConfiguration.series = datum.graph.series;

			datum.minimapGraph = new Rickshaw.Graph(minimapGraphConfiguration);

			datum.graph.onUpdate(function() {
				datum.minimap.update();
			}.bind(this));

			datum.graph.onConfigure(function(args) {
				datum.minimapGraph.configure(args);
			}.bind(this));

			datum.minimapGraph.render();
		};

		var mainElement = d3.select(this.element);

		var individualGraphHeight = this.config.height / this.graphs.length;
		var totalWidth = this.config.width;

		var minimap = this;
		var mainData = this.graphs.map(function(item) {
			var domainScale = d3.scale.linear();
			domainScale.interpolate(d3.interpolateRound);
			domainScale.domain([0, totalWidth]);
			domainScale.range(graph.dataDomain());

			return {
				minimap: minimap,
				graph: item,
				height: individualGraphHeight,
				width: totalWidth,
				domainScale: domainScale
			};
		});

		var graphBlock = mainElement.selectAll("div.minimap")
			.data(mainData);

		graphBlock.enter()
			.append("div")
			.classed("minimap", true)
			.each(constructGraph, this.config);

		graphBlock.exit()
			.remove();

		// Use the first graph as of the "master" for the frame state
		var masterData = mainData[0];
		var currentWindow = [masterData.graph.window.xMin, masterData.graph.window.xMax];
		var currentFrame = [0, this.config.width];
		for (var i = 0; i < currentWindow.length; i++) {
			if (currentWindow[i] !== undefined) {
				currentFrame[i] = masterData.domainScale.invert(currentWindow[i]);
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

		mainData.forEach(function(datum) {
			//			datum.minimapGraph.update();
		});

		console.log('GREAT SUCCESS');
	},
});