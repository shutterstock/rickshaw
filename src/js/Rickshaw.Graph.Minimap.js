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
			height: 400,
			width: 500,
			frameTopThickness: 50,
			frameHandleThickness: 10
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

		var graphsHeight = this.config.height - (this.config.frameTopThickness * 2);
		var individualGraphHeight = graphsHeight / this.graphs.length;
		var graphsWidth = this.config.width - (this.config.frameHandleThickness * 2);

		var minimap = this;

		var constructGraph = function(datum, index) {
			var domainScale = d3.scale.linear();
			domainScale.interpolate(d3.interpolateRound);
			domainScale.domain([0, graphsWidth]);
			domainScale.range(datum.dataDomain());

			datum.minimapGraph = {
				container: minimap,
				height: individualGraphHeight,
				width: graphsWidth,
				domainScale: domainScale
			};

			// If anyone has an elegant way to do this without jQuery, please change...
			var minimapGraphConfiguration = jQuery.extend({}, datum.configuration);

			minimapGraphConfiguration.element = this.appendChild(document.createElement("div"));
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

		var graphContainerBlock = mainElement.selectAll("div.rickshaw_minimap")
			.data(this.graphs);

		var translateCommand = "translate(" +
			this.config.frameHandleThickness + "px, " +
			this.config.frameTopThickness + "px)";

		graphContainerBlock.enter()
			.append("div")
			.classed("rickshaw_minimap", true)
			.style("transform", translateCommand)
			.each(constructGraph, this.config);

		graphContainerBlock.exit()
			.remove();

		// Use the first graph as of the "master" for the frame state
		var masterGraph = this.graphs[0];
		var currentWindow = [masterGraph.window.xMin, masterGraph.window.xMax];
		var currentFrame = [0, graphsWidth];
		for (var i = 0; i < currentWindow.length; i++) {
			if (currentWindow[i] !== undefined) {
				currentFrame[i] = masterGraph.minimapGraph.domainScale.invert(currentWindow[i]);
			}
			currentFrame[i] = Math.round(currentFrame[i]);
		}

		var svgBlock = mainElement.selectAll("svg.rickshaw_minimap")
			.data([this.config]);

		svgBlock.enter()
			.append("svg")
			.classed("rickshaw_minimap", true);

		svgBlock
			.style("height", this.config.height)
			.style("width", this.config.width + 50)
			.style("position", "relative")
			.style("top", -graphsHeight);

		var dataString = masterGraph.window.xMin + ", " + masterGraph.window.xMax;
		var dimmingPathBlock = svgBlock.selectAll("path.rickshaw_minimap_dimming")
			.data([this.config]);

		dimmingPathBlock.enter()
			.append("path")
			.classed("rickshaw_minimap_dimming", true);

		var pathDescriptor = "";
		pathDescriptor += " M " + this.config.frameHandleThickness + " " + this.config.frameTopThickness;
		pathDescriptor += " h " + graphsWidth;
		pathDescriptor += " v " + graphsHeight;
		pathDescriptor += " h " + -graphsWidth;
		pathDescriptor += " z";
		pathDescriptor += " M " + (this.config.frameHandleThickness + currentFrame[0]) +
			" " + this.config.frameTopThickness;
		pathDescriptor += " H " + (this.config.frameHandleThickness + currentFrame[1]);
		pathDescriptor += " v " + graphsHeight;
		pathDescriptor += " H " + (this.config.frameHandleThickness + currentFrame[0]);
		pathDescriptor += " z";

		dimmingPathBlock
			.attr("d", pathDescriptor)
			.attr("fill", "white")
			.attr("fill-opacity", "0.5")
			.attr("fill-rule", "evenodd");

		var framePathBlock = svgBlock.selectAll("path.rickshaw_minimap_frame")
			.data([this.config]);

		framePathBlock.enter()
			.append("path")
			.classed("rickshaw_minimap_frame", true);

		pathDescriptor = "";
		pathDescriptor += " M " + currentFrame[0] + " 0";
		pathDescriptor += " H " + (currentFrame[1] + (this.config.frameHandleThickness * 2));
		pathDescriptor += " V " + this.config.height;
		pathDescriptor += " H " + (currentFrame[0]);
		pathDescriptor += " z";
		pathDescriptor += " M " + (currentFrame[0] + this.config.frameHandleThickness) + " " +
			this.config.frameTopThickness;
		pathDescriptor += " H " + (currentFrame[1] + this.config.frameHandleThickness);
		pathDescriptor += " v " + graphsHeight;
		pathDescriptor += " H " + (currentFrame[0] + this.config.frameHandleThickness);
		pathDescriptor += " z";

		framePathBlock
			.attr("d", pathDescriptor)
			.attr("fill", "gray")
			.attr("fill-rule", "evenodd");

		this.graphs.forEach(function(datum) {
			datum.minimapGraph.graph.update();
		});

		console.log('GREAT SUCCESS');
	},
});