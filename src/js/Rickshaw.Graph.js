Rickshaw.namespace('Rickshaw.Graph');

Rickshaw.Graph = function(args) {

	this.element = args.element;
	this.series = args.series;

	this.defaults = {
		interpolation: 'cardinal',
		offset: 'zero',
		min: undefined,
		max: undefined
	};

	Rickshaw.keys(this.defaults).forEach( function(k) {
		this[k] = args[k] || this.defaults[k];
	}, this );

	this.window = {};

	this.updateCallbacks = [];

	var self = this;

	this.initialize = function(args) {

		this.validateSeries(args.series);

		this.series.active = function() { return self.series.filter( function(s) { return !s.disabled } ) };

		this.setSize({ width: args.width, height: args.height });

		this.element.classList.add('rickshaw_graph');
		this.vis = d3.select(this.element)
			.append("svg:svg")
			.attr('width', this.width)
			.attr('height', this.height);

		var renderers = [
			Rickshaw.Graph.Renderer.Stack,
			Rickshaw.Graph.Renderer.Line,
			Rickshaw.Graph.Renderer.Bar,
			Rickshaw.Graph.Renderer.Area,
			Rickshaw.Graph.Renderer.ScatterPlot
		];

		renderers.forEach( function(r) {
			if (!r) return;
			self.registerRenderer(new r( { graph: self } ));
		} );

		this.setRenderer(args.renderer || 'stack', args);
		this.discoverRange();
	};

	this.validateSeries = function(series) {

		if (!(series instanceof Array) && !(series instanceof Rickshaw.Series)) {
			var seriesSignature = Object.prototype.toString.apply(series);
			throw "series is not an array: " + seriesSignature;
		}

		var pointsCount;

		series.forEach( function(s) {

			if (!(s instanceof Object)) {
				throw "series element is not an object: " + s;
			}
			if (!(s.data)) {
				throw "series has no data: " + JSON.stringify(s);
			}
			if (!(s.data instanceof Array)) {
				throw "series data is not an array: " + JSON.stringify(s.data);
			}

			pointsCount = pointsCount || s.data.length;

			if (pointsCount && s.data.length != pointsCount) {
				throw "series cannot have differing numbers of points: " +
					pointsCount	+ " vs " + s.data.length + "; see Rickshaw.Series.zeroFill()";
			}

			var dataTypeX = typeof s.data[0].x;
			var dataTypeY = typeof s.data[0].y;

			if (dataTypeX != 'number' || dataTypeY != 'number') {
				throw "x and y properties of points should be numbers instead of " +
					dataTypeX + " and " + dataTypeY;
			}
		} );
	};

	this.dataDomain = function() {

		// take from the first series
		var data = this.series[0].data;

		return [ data[0].x, data.slice(-1).shift().x ];

	};

	this.discoverRange = function() {

		var domain = this.renderer.domain();

		this.x = d3.scale.linear().domain(domain.x).range([0, this.width]);

		this.y = d3.scale.linear().domain(domain.y).range([this.height, 0]);

		this.y.magnitude = d3.scale.linear()
			.domain([domain.y[0] - domain.y[0], domain.y[1] - domain.y[0]])
			.range([0, this.height]);
	};

	this.render = function() {

		var stackedData = this.stackData();
		this.discoverRange();

		this.renderer.render();

		this.updateCallbacks.forEach( function(callback) {
			callback();
		} );
	};

	this.update = this.render;

	this.stackData = function() {

		var data = this.series.active()
			.map( function(d) { return d.data } )
			.map( function(d) { return d.filter( function(d) { return this._slice(d) }, this ) }, this);

		this.stackData.hooks.data.forEach( function(entry) {
			data = entry.f.apply(self, [data]);
		} );

		var layout = d3.layout.stack();
		layout.offset( self.offset );

		var stackedData = layout(data);

		this.stackData.hooks.after.forEach( function(entry) {
			stackedData = entry.f.apply(self, [data]);
		} );

		var i = 0;
		this.series.forEach( function(series) {
			if (series.disabled) return;
			series.stack = stackedData[i++];
		} );

		this.stackedData = stackedData;
		return stackedData;
	};

	this.stackData.hooks = { data: [], after: [] };

	this._slice = function(d) {

		if (this.window.xMin || this.window.xMax) {

			var isInRange = true;

			if (this.window.xMin && d.x < this.window.xMin) isInRange = false;
			if (this.window.xMax && d.x > this.window.xMax) isInRange = false;

			return isInRange;
		}

		return true;
	};

	this.onUpdate = function(callback) {
		this.updateCallbacks.push(callback);
	};

	this.registerRenderer = function(renderer) {
		this._renderers = this._renderers || {};
		this._renderers[renderer.name] = renderer;
	};

	this.configure = function(args) {

		if (args.width || args.height) {
			this.setSize(args);
		}

		Rickshaw.keys(this.defaults).forEach( function(k) {
			this[k] = k in args ? args[k]
				: k in this ? this[k]
				: this.defaults[k];
		}, this );

		this.setRenderer(args.renderer || this.renderer.name, args);
	};

	this.setRenderer = function(name, args) {

		if (!this._renderers[name]) {
			throw "couldn't find renderer " + name;
		}
		this.renderer = this._renderers[name];

		if (typeof args == 'object') {
			this.renderer.configure(args);
		}
	};

	this.setSize = function(args) {

		args = args || {};

		if (typeof window !== undefined) {
			var style = window.getComputedStyle(this.element, null);
			var elementWidth = parseInt(style.getPropertyValue('width'));
			var elementHeight = parseInt(style.getPropertyValue('height'));
		}

		this.width = args.width || elementWidth || 400;
		this.height = args.height || elementHeight || 250;

		this.vis && this.vis
			.attr('width', this.width)
			.attr('height', this.height);
	}

	this.initialize(args);
};
