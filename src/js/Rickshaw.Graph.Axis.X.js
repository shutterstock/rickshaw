Rickshaw.namespace('Rickshaw.Graph.Axis.X');

Rickshaw.Graph.Axis.X = function(args) {

	var self = this;
	var berthRate = 0.10;

	this.initialize = function(args) {

		this.graph = args.graph;
		this.orientation = args.orientation || 'bottom';

		var pixelsPerTick = 75;
		this.ticks = args.ticks || Math.floor(this.graph.width / pixelsPerTick);
		this.tickSize = args.tickSize || 4;
		this.ticksTreatment = args.ticksTreatment || 'plain';

		if (args.element) {

			this.element = args.element;
			this.vis = d3.select(args.element)
				.append("svg:svg")
				.attr('class', 'rickshaw_graph x_axis_d3');

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
			var elementHeight = parseInt(style.getPropertyValue('height'));

			if (!args.auto) {
				var elementWidth = parseInt(style.getPropertyValue('width'));
			}
		}

		this.width = args.width || elementWidth || this.graph.width;
		this.height = args.height || elementHeight || this.graph.height * berthRate;

		this.vis
			.attr('height', this.height)
			.attr('width', this.width * (1 + berthRate));

		var berth = Math.floor((this.width * berthRate)/2);
		this.element.style.left = -1 * berth + 'px';
	};

	this.render = function() {

		if (this.graph.width !== this._renderWidth) this.setSize({ auto: true });

		var axis = d3.svg.axis().scale(this.graph.x).orient(this.orientation);
		axis.tickFormat( args.tickFormat || function(x) { return x } );
 
		var heightOffset = 0
		if (this.orientation == 'top') {
			heightOffset = this.height;
		}
		var berth = Math.floor((this.width * berthRate)/2);
		var transform = 'translate(' + berth + ', ' + heightOffset + ')';

		if (this.element) {
			this.vis.selectAll('*').remove();
		}

		this.vis
			.append("svg:g")
			.attr("class", ["x_ticks_d3", this.ticksTreatment].join(" "))
			.attr("transform", transform)
			.call(axis.ticks(this.ticks).tickSubdivide(0).tickSize(this.tickSize));

		var gridSize = (this.orientation == 'bottom' ? 1 : -1) * this.graph.height;

		this.graph.vis
			.append("svg:g")
			.attr("class", "x_grid_d3")
			.call(axis.ticks(this.ticks).tickSubdivide(0).tickSize(gridSize));

		this._renderHeight = this.graph.height;
	};

	this.initialize(args);
};

