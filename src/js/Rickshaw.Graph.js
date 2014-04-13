Rickshaw.namespace('Rickshaw.Graph');

Rickshaw.Graph = function(args) {

	var self = this;

	this.initialize = function(args) {

		if (!args.element) throw "Rickshaw.Graph needs a reference to an element";
		if (args.element.nodeType !== 1) throw "Rickshaw.Graph element was defined but not an HTML element";

		this.element = args.element;
		this.series = args.series;
		this.window = {};

		this.updateCallbacks = [];
		this.configureCallbacks = [];

		this.defaults = {
			interpolation: 'cardinal',
			offset: 'zero',
			min: undefined,
			max: undefined,
			preserve: false,
			xScale: undefined,
			yScale: undefined,
			stack: true
		};

		this._loadRenderers();
		this.configure(args);
		this.validateSeries(args.series);

		this.series.active = function() { return self.series.filter( function(s) { return !s.disabled } ) };
		this.setSize({ width: args.width, height: args.height });
		this.element.classList.add('rickshaw_graph');

		this.vis = d3.select(this.element)
			.append("svg:svg")
			.attr('width', this.width)
			.attr('height', this.height);

		this.discoverRange();
	};

	this._loadRenderers = function() {

		for (var name in Rickshaw.Graph.Renderer) {
			if (!name || !Rickshaw.Graph.Renderer.hasOwnProperty(name)) continue;
			var r = Rickshaw.Graph.Renderer[name];
			if (!r || !r.prototype || !r.prototype.render) continue;
			self.registerRenderer(new r( { graph: self } ));
		}
	};

	this.validateSeries = function(series) {

		if (!Array.isArray(series) && !(series instanceof Rickshaw.Series)) {
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
			if (!Array.isArray(s.data)) {
				throw "series data is not an array: " + JSON.stringify(s.data);
			}
			
			if (s.data.length > 0) {
				var x = s.data[0].x;
				var y = s.data[0].y;

				if (typeof x != 'number' || ( typeof y != 'number' && y !== null ) ) {
					throw "x and y properties of points should be numbers instead of " +
						(typeof x) + " and " + (typeof y);
				}
			}

			if (s.data.length >= 3) {
				// probe to sanity check sort order
				if (s.data[2].x < s.data[1].x || s.data[1].x < s.data[0].x || s.data[s.data.length - 1].x < s.data[0].x) {
					throw "series data needs to be sorted on x values for series name: " + s.name;
				}
			}

		}, this );
	};

	this.dataDomain = function() {

		var data = this.series.map( function(s) { return s.data } );

		var min = d3.min( data.map( function(d) { return d[0].x } ) );
		var max = d3.max( data.map( function(d) { return d[d.length - 1].x } ) );

		return [min, max];
	};

	this.discoverRange = function() {

		var domain = this.renderer.domain();

		// this.*Scale is coming from the configuration dictionary
		// which may be referenced by the Graph creator, or shared
		// with other Graphs. We need to ensure we copy the scale
		// so that our mutations do not change the object given to us.
		// Hence the .copy()
		this.x = (this.xScale || d3.scale.linear()).copy().domain(domain.x).range([0, this.width]);
		this.y = (this.yScale || d3.scale.linear()).copy().domain(domain.y).range([this.height, 0]);

		this.x.magnitude = d3.scale.linear()
			.domain([domain.x[0] - domain.x[0], domain.x[1] - domain.x[0]])
			.range([0, this.width]);

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

		var preserve = this.preserve;
		if (!preserve) {
			this.series.forEach( function(series) {
				if (series.scale) {
					// data must be preserved when a scale is used
					preserve = true;
				}
			} );
		}

		data = preserve ? Rickshaw.clone(data) : data;

		this.series.active().forEach( function(series, index) {
			if (series.scale) {
				// apply scale to each series
				var seriesData = data[index];
				if(seriesData) {
					seriesData.forEach( function(d) {
						d.y = series.scale(d.y);
					} );
				}
			}
		} );

		this.stackData.hooks.data.forEach( function(entry) {
			data = entry.f.apply(self, [data]);
		} );

		var stackedData;

		if (!this.renderer.unstack) {

			this._validateStackable();

			var layout = d3.layout.stack();
			layout.offset( self.offset );
			stackedData = layout(data);
		}

		stackedData = stackedData || data;

		if (this.renderer.unstack) {
			stackedData.forEach( function(seriesData) {
				seriesData.forEach( function(d) {
					d.y0 = d.y0 === undefined ? 0 : d.y0;
				} );
			} );
		}

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

	this._validateStackable = function() {

		var series = this.series;
		var pointsCount;

		series.forEach( function(s) {

			pointsCount = pointsCount || s.data.length;

			if (pointsCount && s.data.length != pointsCount) {
				throw "stacked series cannot have differing numbers of points: " +
					pointsCount + " vs " + s.data.length + "; see Rickshaw.Series.fill()";
			}

		}, this );
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

	this.onConfigure = function(callback) {
		this.configureCallbacks.push(callback);
	};

	this.registerRenderer = function(renderer) {
		this._renderers = this._renderers || {};
		this._renderers[renderer.name] = renderer;
	};

	this.configure = function(args) {

		this.config = this.config || {};

		if (args.width || args.height) {
			this.setSize(args);
		}

		Rickshaw.keys(this.defaults).forEach( function(k) {
			this.config[k] = k in args ? args[k]
				: k in this ? this[k]
				: this.defaults[k];
		}, this );

		Rickshaw.keys(this.config).forEach( function(k) {
			this[k] = this.config[k];
		}, this );

		if ('stack' in args) args.unstack = !args.stack;

		var renderer = args.renderer || (this.renderer && this.renderer.name) || 'stack';
		this.setRenderer(renderer, args);

		this.configureCallbacks.forEach( function(callback) {
			callback(args);
		} );
	};

	this.setRenderer = function(r, args) {
		if (typeof r == 'function') {
			this.renderer = new r( { graph: self } );
			this.registerRenderer(this.renderer);
		} else {
			if (!this._renderers[r]) {
				throw "couldn't find renderer " + r;
			}
			this.renderer = this._renderers[r];
		}

		if (typeof args == 'object') {
			this.renderer.configure(args);
		}
	};

	this.setSize = function(args) {

		args = args || {};

		if (typeof window !== undefined) {
			var style = window.getComputedStyle(this.element, null);
			var elementWidth = parseInt(style.getPropertyValue('width'), 10);
			var elementHeight = parseInt(style.getPropertyValue('height'), 10);
		}

		this.width = args.width || elementWidth || 400;
		this.height = args.height || elementHeight || 250;

		this.vis && this.vis
			.attr('width', this.width)
			.attr('height', this.height);
	};

	this.initialize(args);
};
