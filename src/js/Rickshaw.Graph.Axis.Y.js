Rickshaw.namespace('Rickshaw.Graph.Axis.Y');

Rickshaw.Graph.Axis.Y = function(args) {

	var self = this;

	this.graph = args.graph;
	this.orientation = args.orientation || 'right';

	var pixelsPerTick = 75;
	this.ticks = args.ticks || Math.floor(this.graph.height / pixelsPerTick); 
	this.tickSize = args.tickSize || 4;
	this.ticksTreatment = args.ticksTreatment || 'plain';

	if (args.element) {

		var berthRate = 0.10;

		if (!args.width || !args.height) {
			var style = window.getComputedStyle(args.element, null);
			var elementWidth = parseInt(style.getPropertyValue('width'));
			var elementHeight = parseInt(style.getPropertyValue('height'));
		}

		this.width = args.width || elementWidth || this.graph.width * berthRate;
		this.height = args.height || elementHeight || this.graph.height;

		this.vis = d3.select(args.element)
			.append("svg:svg")
			.attr('class', 'rickshaw_graph y_axis')
			.attr('width', this.width)
			.attr('height', this.height * (1 + berthRate));

		this.element = this.vis[0][0];
		this.element.style.position = 'relative';
		
		var berth = this.height * berthRate;
		this.element.style.top = -1 * berth + 'px';
		this.element.style.paddingTop = berth + 'px';

	} else {
		this.vis = this.graph.vis;
	}

	this.render = function() {

		var axis = d3.svg.axis().scale(this.graph.y).orient(this.orientation);
		axis.tickFormat( args.tickFormat || function(y) { return y } );

		if (this.orientation == 'left') {
			var transform = 'translate(' + this.width + ', 0)';
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
	};

	this.graph.onUpdate( function() { self.render() } );
};

