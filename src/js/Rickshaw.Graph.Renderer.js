Rickshaw.namespace("Rickshaw.Graph.Renderer");

Rickshaw.Graph.Renderer = Rickshaw.Class.create( {

	name: undefined,
	tension: 0.8,
	strokeWidth: 2,
	unstack: true,
	padding: { top: 0.025, right: 0, bottom: 0, left: 0 },
	stroke: false,
	fill: false,

	initialize: function(args) {
		this.graph = args.graph;
		this.tension = args.tension || this.tension;
		this.graph.unstacker = this.graph.unstacker || new Rickshaw.Graph.Unstacker( { graph: this.graph } );

	},

	seriesPathFactory: function() {
		//implement in subclass
	},

	seriesStrokeFactory: function() {
		// implement in subclass
	},

	domain: function() {

		var values = [];
		var stackedData = this.graph.stackedData || this.graph.stackData();

		var topSeriesData = this.unstack ? stackedData : [ stackedData.slice(-1).shift() ];

		topSeriesData.forEach( function(series) {
			series.forEach( function(d) {
				values.push( d.y + d.y0 );
			} );
		} );

		var xMin = stackedData[0][0].x;
		var xMax = stackedData[0][ stackedData[0].length - 1 ].x;

		xMin -= (xMax - xMin) * (this.padding.left);
		xMax += (xMax - xMin) * (this.padding.right);

		var yMin = ( this.graph.min === 'auto' ? d3.min( values ) : this.graph.min || 0 );
		var yMax = this.graph.max || d3.max( values );

    var dynamicPadding = (yMax - yMin) * this.padding.top;
    yMax = this.graph.max || d3.min([yMax * (1 + dynamicPadding), yMax * (1 + this.padding.top)]);
    if(this.graph.min === 'auto') {
      yMin = d3.max([yMin * (1 - this.padding.top), yMin * (1 - dynamicPadding)]);
    }

		return { x: [xMin, xMax], y: [yMin, yMax] };
	},

	render: function() {

		var graph = this.graph;

		graph.vis.selectAll('*').remove();

		var nodes = graph.vis.selectAll("path")
			.data(this.graph.stackedData)
			.enter().append("svg:path")
			.attr("d", this.seriesPathFactory());

		var i = 0;
		graph.series.forEach( function(series) {
			if (series.disabled) return;
			series.path = nodes[0][i++];
			this._styleSeries(series);
		}, this );
	},

	_styleSeries: function(series) {


		var fill = this.fill ? series.color : 'none';
		var stroke = this.stroke ? series.color : 'none';

		series.path.setAttribute('fill', fill);
		series.path.setAttribute('stroke', stroke);
		series.path.setAttribute('stroke-width', this.strokeWidth);
		series.path.setAttribute('class', series.className);
	},

	setStrokeWidth: function(strokeWidth) {
		if (strokeWidth !== undefined) {
			this.strokeWidth = strokeWidth;
		}
	},

	setTension: function(tension) {
		if (tension !== undefined) {
			this.tension = tension;
		}
	}
} );

