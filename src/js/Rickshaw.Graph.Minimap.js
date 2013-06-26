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
			frameTopThickness: 10,
			frameHandleThickness: 50,
			frameColor: "gray",
			frameOpacity: 0.5
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
			datum.minimapGraph = {
				container: minimap,
				height: individualGraphHeight,
				width: graphsWidth,
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
			.each(constructGraph);

		graphContainerBlock.exit()
			.remove();

		// Use the first graph as the "master" for the frame state
		var masterGraph = this.graphs[0];
		var domainScale = d3.scale.linear();
		domainScale.interpolate(d3.interpolateRound);
		domainScale.domain([0, graphsWidth]);
		domainScale.range(masterGraph.dataDomain());
		var currentWindow = [masterGraph.window.xMin, masterGraph.window.xMax];
		var currentFrame = [0, graphsWidth];
		for (var i = 0; i < currentWindow.length; i++) {
			if (currentWindow[i] !== undefined) {
				currentFrame[i] = domainScale.invert(currentWindow[i]);
			}
			currentFrame[i] = Math.round(currentFrame[i]);
		}

		var registerMouseEvents = function() {
			console.log("mouse event registration");
			var drag = {
				start: null,
				stop: null,
				leftOrRight: null,
			};

			function onMousemove(datum, index) {
				drag.stop = d3.event.clientX;
				console.log("move:" + drag.start + " " + drag.stop);
				var distanceTraveled = drag.stop - drag.start;
				console.log("distance traveled: " + distanceTraveled);
				minimap.graphs.forEach(function(graph) {
					var domainScale = d3.scale.linear();
					domainScale.interpolate(d3.interpolateRound);
					domainScale.domain([0, graphsWidth]);
					domainScale.range(graph.dataDomain());
					var extremaPixelBeforeDrag = domainScale.invert(graph.minimapExtremaBeforeDrag);
					var extremaPixelAfterDrag = extremaPixelBeforeDrag + distanceTraveled;
					if (extremaPixelAfterDrag <= 0) {
						extremaPixelAfterDrag = 0;
					} else if (extremaPixelAfterDrag > graphsWidth) {
						extremaPixelAfterDrag = graphsWidth;
					}
					var extremaDomainAfterDrag = domainScale(extremaPixelAfterDrag);
					if (drag.leftOrRight === "left") {
						if (extremaDomainAfterDrag <= graph.dataDomain()[0]) {
							graph.window.xMin = undefined;
						} else {
							graph.window.xMin = extremaDomainAfterDrag;
						}
					} else {
						if (extremaDomainAfterDrag >= graph.dataDomain()[1]) {
							graph.window.xMax = undefined;
						} else {
							graph.window.xMax = extremaDomainAfterDrag;
						}
					}
					graph.update();
				});
			}

			function onMousedown(leftOrRight) {
				drag.leftOrRight = leftOrRight;
				drag.start = d3.event.clientX;
				minimap.graphs.forEach(function(graph) {
					var currentWindow = [graph.window.xMin, graph.window.xMax];
					for (var i = 0; i < currentWindow.length; i++) {
						if (currentWindow[i] === undefined) {
							currentWindow[i] = graph.dataDomain()[i];
						}
					}
					graph.minimapExtremaBeforeDrag = (leftOrRight === "left" ? currentWindow[0] : currentWindow[1]);
				});

				d3.event.preventDefault ? d3.event.preventDefault() : d3.event.returnValue = false;
				d3.select(document).on("mousemove.rickshaw_minimap", onMousemove);
				d3.select(document).on("mouseup.rickshaw_minimap", onMouseup);
				console.log("down:" + drag.start);
			}

			function onMousedownLeftHandle(datum, index) {
				onMousedown("left");
			}

			function onMousedownRightHandle(datum, index) {
				onMousedown("right");
			}

			function onMouseup(datum, index) {
				d3.select(document).on("mousemove.rickshaw_minimap", null);
				d3.select(document).on("mouseup.rickshaw_minimap", null);
				minimap.graphs.forEach(function(graph) {
					delete graph.minimapExtremaBeforeDrag;
				});
				console.log("up " + drag.stop);
			}

			mainElement.select("path.rickshaw_minimap_lefthandle").on("mousedown", onMousedownLeftHandle);
			mainElement.select("path.rickshaw_minimap_righthandle").on("mousedown", onMousedownRightHandle);
		};

		var svgBlock = mainElement.selectAll("svg.rickshaw_minimap")
			.data([this]);

		svgBlock.enter()
			.append("svg")
			.classed("rickshaw_minimap", true);

		svgBlock
			.style("height", this.config.height)
			.style("width", this.config.width + 50)
			.style("position", "relative")
			.style("top", -graphsHeight);

		var dimmingPathBlock = svgBlock.selectAll("path.rickshaw_minimap_dimming")
			.data([this]);

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
			.data([this]);

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
			.attr("stroke", "white")
			.attr("fill", this.config.frameColor)
			.attr("fill-opacity", this.config.frameOpacity)
			.attr("fill-rule", "evenodd");

		var leftHandleBlock = svgBlock.selectAll("path.rickshaw_minimap_lefthandle")
			.data([this]);

		leftHandleBlock.enter()
			.append("path")
			.classed("rickshaw_minimap_lefthandle", true)
			.each(registerMouseEvents);

		pathDescriptor = "";
		pathDescriptor += " M " + currentFrame[0] + " 0";
		pathDescriptor += " h " + this.config.frameHandleThickness;
		pathDescriptor += " v " + this.config.height;
		pathDescriptor += " h " + -this.config.frameHandleThickness;
		pathDescriptor += " z";

		leftHandleBlock
			.attr("d", pathDescriptor)
			.style("cursor", "ew-resize")
			.style("fill-opacity", "0");

		var rightHandleBlock = svgBlock.selectAll("path.rickshaw_minimap_righthandle")
			.data([this]);

		rightHandleBlock.enter()
			.append("path")
			.classed("rickshaw_minimap_righthandle", true)
			.each(registerMouseEvents);

		pathDescriptor = "";
		pathDescriptor += " M " + (currentFrame[1] + this.config.frameHandleThickness) + " 0";
		pathDescriptor += " h " + this.config.frameHandleThickness;
		pathDescriptor += " v " + this.config.height;
		pathDescriptor += " h " + -this.config.frameHandleThickness;
		pathDescriptor += " z";

		rightHandleBlock
			.attr("d", pathDescriptor)
			.style("cursor", "ew-resize")
			.style("fill-opacity", "0");

		this.graphs.forEach(function(datum) {
			datum.minimapGraph.graph.update();
		});

		console.log('GREAT SUCCESS');
	},
});