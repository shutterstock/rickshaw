Rickshaw.namespace('Rickshaw.Graph.Axis.Y');

Rickshaw.Graph.Axis.Y = function(args) {

	var self = this;
	var berthRate = 0.10;

	this.initialize = function(args) {

		this.graph = args.graph;
		this.orientation = args.orientation || 'right';

		var pixelsPerTick = args.pixelsPerTick || 75;
		this.ticks = args.ticks || Math.floor(this.graph.height / pixelsPerTick);
		this.tickSize = args.tickSize || 4;
		this.ticksTreatment = args.ticksTreatment || 'plain';

		if (args.element) {

			this.element = args.element;
			this.vis = d3.select(args.element)
				.append("svg:svg")
				.attr('class', 'rickshaw_graph y_axis');

			this.element = this.vis[0][0];
			this.element.style.position = 'relative';

			this.setSize({ width: args.width, height: args.height });

		} else {
			this.vis = this.graph.vis;
		}

		this.graph.onUpdate( function() { self.render() } );
	};

	this.setSize = function(args) {

		args = args || {};

		if (!this.element) return;

		if (typeof window !== 'undefined') {

			var style = window.getComputedStyle(this.element.parentNode, null);
			var elementWidth = parseInt(style.getPropertyValue('width'));

			if (!args.auto) {
				var elementHeight = parseInt(style.getPropertyValue('height'));
			}
		}

		this.width = args.width || elementWidth || this.graph.width * berthRate;
		this.height = args.height || elementHeight || this.graph.height;

		this.vis
			.attr('width', this.width)
			.attr('height', this.height * (1 + berthRate));

		var berth = this.height * berthRate;
		this.element.style.top = -1 * berth + 'px';
	};

	this.render = function() {

		if (this.graph.height !== this._renderHeight) this.setSize({ auto: true });

		var axis = d3.svg.axis().scale(this.graph.y).orient(this.orientation);
		axis.tickFormat( args.tickFormat || function(y) { return y } );

		if (this.orientation == 'left') {
			var berth = this.height * berthRate;
			var transform = 'translate(' + this.width + ', ' + berth + ')';
		}

		if (this.element) {
			this.vis.selectAll('*').remove();
		}

		this.vis
			.append("svg:g")
			.attr("class", ["y_ticks", this.ticksTreatment].join(" "))
			.attr("transform", transform)
			.call(axis.ticks(this.ticks).tickSubdivide(0).tickSize(this.tickSize))

		var gridSize = (this.orientation == 'right' ? 1 : -1) * this.graph.width;

		this.graph.vis
			.append("svg:g")
			.attr("class", "y_grid")
			.call(axis.ticks(this.ticks).tickSubdivide(0).tickSize(gridSize));

		this._renderHeight = this.graph.height;
	};

	this.initialize(args);
};

