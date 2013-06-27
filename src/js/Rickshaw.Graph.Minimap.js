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
			width: 800,
			frameTopThickness: 5,
			frameHandleThickness: 40,
			frameColor: "slategray",
			frameOpacity: 0.7
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
				width: graphsWidth
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
		minimap.currentFrame = [0, graphsWidth];
		for (var i = 0; i < currentWindow.length; i++) {
			if (currentWindow[i] !== undefined) {
				minimap.currentFrame[i] = domainScale.invert(currentWindow[i]);
			}
			minimap.currentFrame[i] = Math.round(minimap.currentFrame[i]);
		}

		var registerMouseEvents = function() {
			console.log("mouse event registration");
			var drag = {
				start: null,
				stop: null,
				left: false,
				right: false,
				rigid: false
			};

			function onMousemove(datum, index) {
				drag.stop = d3.event.clientX;
				console.log("move:" + drag.start + " " + drag.stop);
				var distanceTraveled = drag.stop - drag.start;
				console.log("distance traveled: " + distanceTraveled);
				var frameAfterDrag = minimap.frameBeforeDrag.slice(0);
				var minimumFrameWidth = 5;
				if (drag.rigid) {
					minimumFrameWidth = minimap.frameBeforeDrag[1] - minimap.frameBeforeDrag[0];
				}
				if (drag.left) {
					frameAfterDrag[0] += distanceTraveled;
				}
				if (drag.right) {
					frameAfterDrag[1] += distanceTraveled;
				}
				if (frameAfterDrag[0] <= 0) {
					frameAfterDrag[0] = 0;
				}
				if (frameAfterDrag[1] >= graphsWidth) {
					frameAfterDrag[1] = graphsWidth;
				}
				var currentFrameWidth = frameAfterDrag[1] - frameAfterDrag[0];
				if (currentFrameWidth < minimumFrameWidth) {
					if (drag.left) {
						frameAfterDrag[0] = frameAfterDrag[1] - minimumFrameWidth;
					}
					if (drag.right) {
						frameAfterDrag[1] = frameAfterDrag[0] + minimumFrameWidth;
					}
					if (frameAfterDrag[0] <= 0) {
						frameAfterDrag[1] -= frameAfterDrag[0];
						frameAfterDrag[0] = 0;
					}
					if (frameAfterDrag[1] >= graphsWidth) {
						frameAfterDrag[0] -= (frameAfterDrag[1] - graphsWidth);
						frameAfterDrag[1] = graphsWidth;
					}
				}
				minimap.graphs.forEach(function(graph) {
					var domainScale = d3.scale.linear();
					domainScale.interpolate(d3.interpolateRound);
					domainScale.domain([0, graphsWidth]);
					domainScale.range(graph.dataDomain());
					var windowAfterDrag = [
						domainScale(frameAfterDrag[0]),
						domainScale(frameAfterDrag[1])
					];
					if (frameAfterDrag[0] === 0) {
						windowAfterDrag[0] = undefined;
					}
					if (frameAfterDrag[1] === graphsWidth) {
						windowAfterDrag[1] = undefined;
					}
					graph.window.xMin = windowAfterDrag[0];
					graph.window.xMax = windowAfterDrag[1];
					graph.update();

				});
			}

			function onMousedown() {
				drag.start = d3.event.clientX;
				console.log("c:" + minimap.currentFrame.length);
				minimap.frameBeforeDrag = minimap.currentFrame.slice();
				d3.event.preventDefault ? d3.event.preventDefault() : d3.event.returnValue = false;
				d3.select(document).on("mousemove.rickshaw_minimap", onMousemove);
				d3.select(document).on("mouseup.rickshaw_minimap", onMouseup);
				console.log("down:" + drag.start);
			}

			function onMousedownLeftHandle(datum, index) {
				drag.left = true;
				onMousedown();
			}

			function onMousedownRightHandle(datum, index) {
				drag.right = true;
				onMousedown();
			}

			function onMousedownMiddleHandle(datum, index) {
				drag.left = true;
				drag.right = true;
				drag.rigid = true;
				onMousedown();
			}

			function onMouseup(datum, index) {
				d3.select(document).on("mousemove.rickshaw_minimap", null);
				d3.select(document).on("mouseup.rickshaw_minimap", null);
				delete minimap.frameBeforeDrag;
				drag.left = false;
				drag.right = false;
				drag.rigid = false;
				console.log("up " + drag.stop);
			}

			mainElement.select("path.rickshaw_minimap_lefthandle").on("mousedown", onMousedownLeftHandle);
			mainElement.select("path.rickshaw_minimap_righthandle").on("mousedown", onMousedownRightHandle);
			mainElement.select("path.rickshaw_minimap_middlehandle").on("mousedown", onMousedownMiddleHandle);
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
		pathDescriptor += " M " + (this.config.frameHandleThickness + minimap.currentFrame[0]) +
			" " + this.config.frameTopThickness;
		pathDescriptor += " H " + (this.config.frameHandleThickness + minimap.currentFrame[1]);
		pathDescriptor += " v " + graphsHeight;
		pathDescriptor += " H " + (this.config.frameHandleThickness + minimap.currentFrame[0]);
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
		pathDescriptor += " M " + minimap.currentFrame[0] + " 0";
		pathDescriptor += " H " + (minimap.currentFrame[1] + (this.config.frameHandleThickness * 2));
		pathDescriptor += " V " + this.config.height;
		pathDescriptor += " H " + (minimap.currentFrame[0]);
		pathDescriptor += " z";
		pathDescriptor += " M " + (minimap.currentFrame[0] + this.config.frameHandleThickness) + " " +
			this.config.frameTopThickness;
		pathDescriptor += " H " + (minimap.currentFrame[1] + this.config.frameHandleThickness);
		pathDescriptor += " v " + graphsHeight;
		pathDescriptor += " H " + (minimap.currentFrame[0] + this.config.frameHandleThickness);
		pathDescriptor += " z";

		framePathBlock
			.attr("d", pathDescriptor)
			.attr("stroke", "white")
			.attr("stroke-width", 2)
			.attr("stroke-linejoin", "round")
			.attr("fill", this.config.frameColor)
			.attr("fill-opacity", this.config.frameOpacity)
			.attr("fill-rule", "evenodd");

		var gripperColor = d3.rgb(this.config.frameColor).darker().toString();
		var gripperBlock = svgBlock.selectAll("path.rickshaw_minimap_gripper")
			.data([this]);

		gripperBlock.enter()
			.append("path")
			.classed("rickshaw_minimap_gripper", true);

		pathDescriptor = "";
		var spacings = [0.4, 0.5, 0.6];
		var spacingIndex;
		for (spacingIndex = 0; spacingIndex < spacings.length; spacingIndex++) {
			pathDescriptor += " M " + Math.round((minimap.currentFrame[0] + (this.config.frameHandleThickness * spacings[spacingIndex]))) +
				" " + Math.round(this.config.height * 0.3);
			pathDescriptor += " V " + Math.round(this.config.height * 0.7);
		}
		for (spacingIndex = 0; spacingIndex < spacings.length; spacingIndex++) {
			pathDescriptor += " M " + Math.round((minimap.currentFrame[1] + (this.config.frameHandleThickness * (1 + spacings[spacingIndex])))) +
				" " + Math.round(this.config.height * 0.3);
			pathDescriptor += " V " + Math.round(this.config.height * 0.7);
		}

		gripperBlock
			.attr("d", pathDescriptor)
			.attr("stroke", gripperColor);

		var leftHandleBlock = svgBlock.selectAll("path.rickshaw_minimap_lefthandle")
			.data([this]);

		leftHandleBlock.enter()
			.append("path")
			.classed("rickshaw_minimap_lefthandle", true)
			.each(registerMouseEvents);

		pathDescriptor = "";
		pathDescriptor += " M " + minimap.currentFrame[0] + " 0";
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
		pathDescriptor += " M " + (minimap.currentFrame[1] + this.config.frameHandleThickness) + " 0";
		pathDescriptor += " h " + this.config.frameHandleThickness;
		pathDescriptor += " v " + this.config.height;
		pathDescriptor += " h " + -this.config.frameHandleThickness;
		pathDescriptor += " z";

		rightHandleBlock
			.attr("d", pathDescriptor)
			.style("cursor", "ew-resize")
			.style("fill-opacity", "0");

		var middleHandleBlock = svgBlock.selectAll("path.rickshaw_minimap_middlehandle")
			.data([this]);

		middleHandleBlock.enter()
			.append("path")
			.classed("rickshaw_minimap_middlehandle", true)
			.each(registerMouseEvents);

		pathDescriptor = "";
		pathDescriptor += " M " + (minimap.currentFrame[0] + this.config.frameHandleThickness) + " 0";
		pathDescriptor += " H " + (minimap.currentFrame[1] + this.config.frameHandleThickness);
		pathDescriptor += " v " + this.config.height;
		pathDescriptor += " H " + (minimap.currentFrame[0] + this.config.frameHandleThickness);
		pathDescriptor += " z";

		middleHandleBlock
			.attr("d", pathDescriptor)
			.style("cursor", "move")
			.style("fill-opacity", "0");

		this.graphs.forEach(function(datum) {
			datum.minimapGraph.graph.update();
		});

		console.log('GREAT SUCCESS');
	}
});