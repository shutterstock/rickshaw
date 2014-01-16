Rickshaw.namespace('Rickshaw.Graph.RangeSlider.Preview');

Rickshaw.Graph.RangeSlider.Preview = Rickshaw.Class.create({

	initialize: function(args) {

		if (!args.element) throw "Rickshaw.Graph.RangeSlider.Preview needs a reference to an element";
		if (!args.graph && !args.graphs) throw "Rickshaw.Graph.RangeSlider.Preview needs a reference to an graph or an array of graphs";

		this.element = args.element;
		this.graphs = args.graph ? [ args.graph ] : args.graphs;

		this.defaults = {
			height: 75,
			width: 400,
			gripperColor: undefined,
			frameTopThickness: 3,
			frameHandleThickness: 10,
			frameColor: "#d4d4d4",
			frameOpacity: 1,
			minimumFrameWidth: 0
		};

		this.defaults.gripperColor = d3.rgb(this.defaults.frameColor).darker().toString(); 

		this.configureCallbacks = [];
		this.slideCallbacks = [];

		this.previews = [];

		args.width = args.width || this.graphs[0].width || this.defaults.width;
		args.height = args.height || this.graphs[0].height / 5 || this.defaults.height;

		this.configure(args);
		this.render();
	},

	onSlide: function(callback) {
		this.slideCallbacks.push(callback);
	},

	onConfigure: function(callback) {
		this.configureCallbacks.push(callback);
	},

	configure: function(args) {

		this.config = {};

		this.configureCallbacks.forEach(function(callback) {
			callback(args);
		});

		Rickshaw.keys(this.defaults).forEach(function(k) {
			this.config[k] = k in args ? args[k]
				: k in this.config ? this.config[k]
				: this.defaults[k];
		}, this);

		if (args.width) {
			this.previews.forEach(function(preview) {
				var width = args.width - this.config.frameHandleThickness * 2;
				preview.setSize({ width: width });
			}, this);
		}

		if (args.height) {
			this.previews.forEach(function(preview) {
				var height = this.previewHeight / this.graphs.length;
				preview.setSize({ height: height });
			}, this);
		}
	},

	render: function() {

		var self = this;

		this.svg = d3.select(this.element)
			.selectAll("svg.rickshaw_range_slider_preview")
			.data([null]);

		this.previewHeight = this.config.height - (this.config.frameTopThickness * 2);
		this.previewWidth = this.config.width - (this.config.frameHandleThickness * 2);

		this.currentFrame = [0, this.previewWidth];

		var buildGraph = function(parent, index) {

			var graphArgs = Rickshaw.extend({}, parent.config);
			var height = self.previewHeight / self.graphs.length;
			var renderer = parent.renderer.name;

			Rickshaw.extend(graphArgs, {
				element: this.appendChild(document.createElement("div")),
				height: height,
				width: self.previewWidth,
				series: parent.series,
				renderer: renderer
			});

			var graph = new Rickshaw.Graph(graphArgs);
			self.previews.push(graph);

			parent.onUpdate(function() { graph.render(); self.render() });

			parent.onConfigure(function(args) { 
				// don't propagate height
				delete args.height;
				graph.configure(args);
				graph.render();
			});

			graph.render();
		};

		var graphContainer = d3.select(this.element)
			.selectAll("div.rickshaw_range_slider_preview_container")
			.data(this.graphs);

		var translateCommand = "translate(" +
			this.config.frameHandleThickness + "px, " +
			this.config.frameTopThickness + "px)";

		graphContainer.enter()
			.append("div")
			.classed("rickshaw_range_slider_preview_container", true)
			.style("-webkit-transform", translateCommand)
			.style("-moz-transform", translateCommand)
			.style("-ms-transform", translateCommand)
			.style("transform", translateCommand)
			.each(buildGraph);

		graphContainer.exit()
			.remove();

		// Use the first graph as the "master" for the frame state
		var masterGraph = this.graphs[0];

		var domainScale = d3.scale.linear()
			.domain([0, this.previewWidth])
			.range(masterGraph.dataDomain());

		var currentWindow = [masterGraph.window.xMin, masterGraph.window.xMax];

		this.currentFrame[0] = currentWindow[0] === undefined ? 
			0 : Math.round(domainScale.invert(currentWindow[0]));

		if (this.currentFrame[0] < 0) this.currentFrame[0] = 0;

		this.currentFrame[1] = currentWindow[1] === undefined ?
			this.previewWidth : domainScale.invert(currentWindow[1]);

		if (this.currentFrame[1] - this.currentFrame[0] < self.config.minimumFrameWidth) {
			this.currentFrame[1] = (this.currentFrame[0] || 0) + self.config.minimumFrameWidth;
		}

		this.svg.enter()
			.append("svg")
			.classed("rickshaw_range_slider_preview", true)
			.style("height", this.config.height + "px")
			.style("width", this.config.width + "px")
			.style("position", "relative")
			.style("top", -this.previewHeight + "px");

		this._renderDimming();
		this._renderFrame();
		this._renderGrippers();
		this._renderHandles();
		this._renderMiddle();

		this._registerMouseEvents();
	},

	_renderDimming: function() {

		var element = this.svg
			.selectAll("path.dimming")
			.data([null]);

		element.enter()
			.append("path")
			.attr("fill", "white")
			.attr("fill-opacity", "0.7")
			.attr("fill-rule", "evenodd")
			.classed("dimming", true);

		var path = "";
		path += " M " + this.config.frameHandleThickness + " " + this.config.frameTopThickness;
		path += " h " + this.previewWidth;
		path += " v " + this.previewHeight;
		path += " h " + -this.previewWidth;
		path += " z ";
		path += " M " + Math.max(this.currentFrame[0], this.config.frameHandleThickness) + " " + this.config.frameTopThickness;
		path += " H " + Math.min(this.currentFrame[1] + this.config.frameHandleThickness * 2, this.previewWidth + this.config.frameHandleThickness);
		path += " v " + this.previewHeight;
		path += " H " + Math.max(this.currentFrame[0], this.config.frameHandleThickness);
		path += " z";

		element.attr("d", path);
	},

	_renderFrame: function() {

		var element = this.svg
			.selectAll("path.frame")
			.data([null]);

		element.enter()
			.append("path")
			.attr("stroke", "white")
			.attr("stroke-width", "1px")
			.attr("stroke-linejoin", "round")
			.attr("fill", this.config.frameColor)
			.attr("fill-opacity", this.config.frameOpacity)
			.attr("fill-rule", "evenodd")
			.classed("frame", true);

		var path = "";
		path += " M " + this.currentFrame[0] + " 0";
		path += " H " + (this.currentFrame[1] + (this.config.frameHandleThickness * 2));
		path += " V " + this.config.height;
		path += " H " + (this.currentFrame[0]);
		path += " z";
		path += " M " + (this.currentFrame[0] + this.config.frameHandleThickness) + " " + this.config.frameTopThickness;
		path += " H " + (this.currentFrame[1] + this.config.frameHandleThickness);
		path += " v " + this.previewHeight;
		path += " H " + (this.currentFrame[0] + this.config.frameHandleThickness);
		path += " z";

		element.attr("d", path);
	},

	_renderGrippers: function() {

		var gripper = this.svg.selectAll("path.gripper")
			.data([null]);

		gripper.enter()
			.append("path")
			.attr("stroke", this.config.gripperColor)
			.classed("gripper", true);

		var path = "";

		[0.4, 0.6].forEach(function(spacing) {
			path += " M " + Math.round((this.currentFrame[0] + (this.config.frameHandleThickness * spacing))) + " " + Math.round(this.config.height * 0.3);
			path += " V " + Math.round(this.config.height * 0.7);
			path += " M " + Math.round((this.currentFrame[1] + (this.config.frameHandleThickness * (1 + spacing)))) + " " + Math.round(this.config.height * 0.3);
			path += " V " + Math.round(this.config.height * 0.7);
		}.bind(this));

		gripper.attr("d", path);
	},

	_renderHandles: function() {

		var leftHandle = this.svg.selectAll("rect.left_handle")
			.data([null]);

		leftHandle.enter()
			.append("rect")
			.attr('width', this.config.frameHandleThickness)
			.attr('height', this.config.height)
			.style("cursor", "ew-resize")
			.style("fill-opacity", "0")
			.classed("left_handle", true);

		leftHandle.attr('x', this.currentFrame[0]);

		var rightHandle = this.svg.selectAll("rect.right_handle")
			.data([null]);

		rightHandle.enter()
			.append("rect")
			.attr('width', this.config.frameHandleThickness)
			.attr('height', this.config.height)
			.style("cursor", "ew-resize")
			.style("fill-opacity", "0")
			.classed("right_handle", true);

		rightHandle.attr('x', this.currentFrame[1] + this.config.frameHandleThickness);
	},

	_renderMiddle: function() {

		var middleHandle = this.svg.selectAll("rect.middle_handle")
			.data([null]);

		middleHandle.enter()
			.append("rect")
			.attr('height', this.config.height)
			.style("cursor", "move")
			.style("fill-opacity", "0")
			.classed("middle_handle", true);

		middleHandle
			.attr('width', Math.max(0, this.currentFrame[1] - this.currentFrame[0]))
			.attr('x', this.currentFrame[0] + this.config.frameHandleThickness);
	},

	_registerMouseEvents: function() {

		var element = d3.select(this.element);

		var drag = {
			target: null,
			start: null,
			stop: null,
			left: false,
			right: false,
			rigid: false
		};

		var self = this;

		function onMousemove(datum, index) {

			drag.stop = self._getClientXFromEvent(d3.event, drag);
			var distanceTraveled = drag.stop - drag.start;
			var frameAfterDrag = self.frameBeforeDrag.slice(0);
			var minimumFrameWidth = self.config.minimumFrameWidth;

			if (drag.rigid) {
				minimumFrameWidth = self.frameBeforeDrag[1] - self.frameBeforeDrag[0];
			}
			if (drag.left) {
				frameAfterDrag[0] = Math.max(frameAfterDrag[0] + distanceTraveled, 0);
			}
			if (drag.right) {
				frameAfterDrag[1] = Math.min(frameAfterDrag[1] + distanceTraveled, self.previewWidth);
			}

			var currentFrameWidth = frameAfterDrag[1] - frameAfterDrag[0];

			if (currentFrameWidth <= minimumFrameWidth) {

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
				if (frameAfterDrag[1] >= self.previewWidth) {
					frameAfterDrag[0] -= (frameAfterDrag[1] - self.previewWidth);
					frameAfterDrag[1] = self.previewWidth;
				}
			}

			self.graphs.forEach(function(graph) {

				var domainScale = d3.scale.linear()
					.interpolate(d3.interpolateNumber)
					.domain([0, self.previewWidth])
					.range(graph.dataDomain());

				var windowAfterDrag = [
					domainScale(frameAfterDrag[0]),
					domainScale(frameAfterDrag[1])
				];

				self.slideCallbacks.forEach(function(callback) {
					callback(graph, windowAfterDrag[0], windowAfterDrag[1]);
				});

				if (frameAfterDrag[0] === 0) {
					windowAfterDrag[0] = undefined;
				}
				if (frameAfterDrag[1] === self.previewWidth) {
					windowAfterDrag[1] = undefined;
				}
				graph.window.xMin = windowAfterDrag[0];
				graph.window.xMax = windowAfterDrag[1];

				graph.update();
			});
		}

		function onMousedown() {
			drag.target = d3.event.target;
			drag.start = self._getClientXFromEvent(d3.event, drag);
			self.frameBeforeDrag = self.currentFrame.slice();
			d3.event.preventDefault ? d3.event.preventDefault() : d3.event.returnValue = false;
			d3.select(document).on("mousemove.rickshaw_range_slider_preview", onMousemove);
			d3.select(document).on("mouseup.rickshaw_range_slider_preview", onMouseup);
			d3.select(document).on("touchmove.rickshaw_range_slider_preview", onMousemove);
			d3.select(document).on("touchend.rickshaw_range_slider_preview", onMouseup);
			d3.select(document).on("touchcancel.rickshaw_range_slider_preview", onMouseup);
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
			d3.select(document).on("mousemove.rickshaw_range_slider_preview", null);
			d3.select(document).on("mouseup.rickshaw_range_slider_preview", null);
			d3.select(document).on("touchmove.rickshaw_range_slider_preview", null);
			d3.select(document).on("touchend.rickshaw_range_slider_preview", null);
			d3.select(document).on("touchcancel.rickshaw_range_slider_preview", null);
			delete self.frameBeforeDrag;
			drag.left = false;
			drag.right = false;
			drag.rigid = false;
		}

		element.select("rect.left_handle").on("mousedown", onMousedownLeftHandle);
		element.select("rect.right_handle").on("mousedown", onMousedownRightHandle);
		element.select("rect.middle_handle").on("mousedown", onMousedownMiddleHandle);
		element.select("rect.left_handle").on("touchstart", onMousedownLeftHandle);
		element.select("rect.right_handle").on("touchstart", onMousedownRightHandle);
		element.select("rect.middle_handle").on("touchstart", onMousedownMiddleHandle);
	},

	_getClientXFromEvent: function(event, drag) {

		switch (event.type) {
			case 'touchstart':
			case 'touchmove':
				var touchList = event.changedTouches;
				var touch = null;
				for (var touchIndex = 0; touchIndex < touchList.length; touchIndex++) {
					if (touchList[touchIndex].target === drag.target) {
						touch = touchList[touchIndex];
						break;
					}
				}
				return touch !== null ? touch.clientX : undefined;

			default:
				return event.clientX;
		}
	}
});

