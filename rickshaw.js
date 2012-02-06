Rickshaw = {

	namespace: function(namespace, obj) { 

		var parts = namespace.split('.');

		// for rudimentary compatibility w/ node
		var root = typeof global != 'undefined' ? global : window;

		var parent = root.Rickshaw;

		for(var i = 1, length = parts.length; i < length; i++) {
			currentPart = parts[i];
			parent[currentPart] = parent[currentPart] || {};
			parent = parent[currentPart];
		}
		return parent;
	},

	keys: function(obj) {
		var keys = [];
		for (var key in obj) keys.push(key);
		return keys;	
	}
}
Rickshaw.namespace('Rickshaw.Compat.ClassList');

Rickshaw.Compat.ClassList = function() {

	/* adapted from http://purl.eligrey.com/github/classList.js/blob/master/classList.js */

	if (typeof document !== "undefined" && !("classList" in document.createElement("a"))) {

	(function (view) {

	"use strict";

	var
		  classListProp = "classList"
		, protoProp = "prototype"
		, elemCtrProto = (view.HTMLElement || view.Element)[protoProp]
		, objCtr = Object
		, strTrim = String[protoProp].trim || function () {
			return this.replace(/^\s+|\s+$/g, "");
		}
		, arrIndexOf = Array[protoProp].indexOf || function (item) {
			var
				  i = 0
				, len = this.length
			;
			for (; i < len; i++) {
				if (i in this && this[i] === item) {
					return i;
				}
			}
			return -1;
		}
		// Vendors: please allow content code to instantiate DOMExceptions
		, DOMEx = function (type, message) {
			this.name = type;
			this.code = DOMException[type];
			this.message = message;
		}
		, checkTokenAndGetIndex = function (classList, token) {
			if (token === "") {
				throw new DOMEx(
					  "SYNTAX_ERR"
					, "An invalid or illegal string was specified"
				);
			}
			if (/\s/.test(token)) {
				throw new DOMEx(
					  "INVALID_CHARACTER_ERR"
					, "String contains an invalid character"
				);
			}
			return arrIndexOf.call(classList, token);
		}
		, ClassList = function (elem) {
			var
				  trimmedClasses = strTrim.call(elem.className)
				, classes = trimmedClasses ? trimmedClasses.split(/\s+/) : []
				, i = 0
				, len = classes.length
			;
			for (; i < len; i++) {
				this.push(classes[i]);
			}
			this._updateClassName = function () {
				elem.className = this.toString();
			};
		}
		, classListProto = ClassList[protoProp] = []
		, classListGetter = function () {
			return new ClassList(this);
		}
	;
	// Most DOMException implementations don't allow calling DOMException's toString()
	// on non-DOMExceptions. Error's toString() is sufficient here.
	DOMEx[protoProp] = Error[protoProp];
	classListProto.item = function (i) {
		return this[i] || null;
	};
	classListProto.contains = function (token) {
		token += "";
		return checkTokenAndGetIndex(this, token) !== -1;
	};
	classListProto.add = function (token) {
		token += "";
		if (checkTokenAndGetIndex(this, token) === -1) {
			this.push(token);
			this._updateClassName();
		}
	};
	classListProto.remove = function (token) {
		token += "";
		var index = checkTokenAndGetIndex(this, token);
		if (index !== -1) {
			this.splice(index, 1);
			this._updateClassName();
		}
	};
	classListProto.toggle = function (token) {
		token += "";
		if (checkTokenAndGetIndex(this, token) === -1) {
			this.add(token);
		} else {
			this.remove(token);
		}
	};
	classListProto.toString = function () {
		return this.join(" ");
	};

	if (objCtr.defineProperty) {
		var classListPropDesc = {
			  get: classListGetter
			, enumerable: true
			, configurable: true
		};
		try {
			objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
		} catch (ex) { // IE 8 doesn't support enumerable:true
			if (ex.number === -0x7FF5EC54) {
				classListPropDesc.enumerable = false;
				objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
			}
		}
	} else if (objCtr[protoProp].__defineGetter__) {
		elemCtrProto.__defineGetter__(classListProp, classListGetter);
	}

	}(self));

	}
};

if ( (typeof RICKSHAW_NO_COMPAT !== "undefined" && !RICKSHAW_NO_COMPAT) || typeof RICKSHAW_NO_COMPAT === "undefined") {
	new Rickshaw.Compat.ClassList();
}
Rickshaw.namespace('Rickshaw.Graph');

Rickshaw.Graph = function(args) {

	this.element = args.element;
	this.interpolation = args.interpolation || 'cardinal';
	this.series = args.series;
	this.offset = 'zero';
	this.stroke = args.stroke || false;

	var style = window.getComputedStyle(this.element, null);
	var elementWidth = parseInt(style.getPropertyValue('width'));
	var elementHeight = parseInt(style.getPropertyValue('height'));

	this.width = args.width || elementWidth || 400;
	this.height = args.height || elementHeight || 250;

	this.window = {};

	this.updateCallbacks = [];

	var self = this;

	this.initialize = function(args) {

		this.validateSeries(args.series);

		this.series.active = function() { return self.series.filter( function(s) { return !s.disabled } ) };

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

		this.setRenderer(args.renderer || 'stack');
		this.discoverRange();
	}

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
	}

	this.dataDomain = function() {
		
		// take from the first series
		var data = this.series[0].data;
		
		return [ data[0].x, data.slice(-1).shift().x ]; 

	}

	this.discoverRange = function() {

		var domain = this.renderer.domain();
	
		this.x = d3.scale.linear().domain(domain.x).range([0, this.width]);

		this.y = d3.scale.linear().domain(domain.y).range([this.height, 0]);
		this.y.magnitude = d3.scale.linear().domain(domain.y).range([0, this.height]);
		
	}

	this.render = function() {

		var stackedData = this.stackData();
		this.discoverRange();

		this.renderer.render();

		this.updateCallbacks.forEach( function(callback) {
			callback();
		} );
	}

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
	}

	this.stackData.hooks = { data: [], after: [] };

	this._slice = function(d) {

		if (this.window.xMin || this.window.xMax) {
			
			var isInRange = true;
			
			if (this.window.xMin && d.x <= this.window.xMin) isInRange = false;
			if (this.window.xMax && d.x >= this.window.xMax) isInRange = false;
			
			return isInRange;
		}

		return true;
	}

	this.onUpdate = function(callback) {
		this.updateCallbacks.push(callback);
	}

	this.registerRenderer = function(renderer) {
		this._renderers = this._renderers || {};
		this._renderers[renderer.name] = renderer;			
	}
	
	this.setRenderer = function(name) {

		if (!this._renderers[name]) {
			throw "couldn't find renderer " + name;
		}
		this.renderer = this._renderers[name]; 
	}

	this.initialize(args);
}
Rickshaw.namespace('Rickshaw.Fixtures.Color');

Rickshaw.Fixtures.Color = function() {

	this.schemes = {};

	this.schemes.spectrum14 = [
		'#ecb796',
		'#dc8f70',
		'#b2a470',
		'#92875a',
		'#716c49',
		'#d2ed82',
		'#bbe468',
		'#a1d05d',
		'#e7cbe6',
		'#d8aad6',
		'#a888c2',
		'#9dc2d3',
		'#649eb9',
		'#387aa3'
	].reverse();

	this.schemes.spectrum2000 = [
		'#57306f',
		'#514c76',
		'#646583',
		'#738394',
		'#6b9c7d',
		'#84b665',
		'#a7ca50',
		'#bfe746',
		'#e2f528',
		'#fff726',
		'#ecdd00',
		'#d4b11d',
		'#de8800',
		'#de4800',
		'#c91515',
		'#9a0000',
		'#7b0429',
		'#580839',
		'#31082b'
	];

	this.schemes.spectrum2001 = [
		'#2f243f',
		'#3c2c55',
		'#4a3768',
		'#565270',
		'#6b6b7c',
		'#72957f',
		'#86ad6e',
		'#a1bc5e',
		'#b8d954',
		'#d3e04e',
		'#ccad2a',
		'#cc8412',
		'#c1521d',
		'#ad3821',
		'#8a1010',
		'#681717',
		'#531e1e',
		'#3d1818',
		'#320a1b'
    ];

	this.schemes.classic9 = [
		'#423d4f',
		'#4a6860',
		'#848f39',
		'#a2b73c',
		'#ddcb53',
		'#c5a32f',
		'#7d5836',
		'#963b20',
		'#7c2626',
		'#491d37',
		'#2f254a'
	].reverse();

	this.schemes.httpStatus = {
		503: '#ea5029',
		502: '#d23f14',
		500: '#bf3613',
		410: '#efacea',
		409: '#e291dc',
		403: '#f457e8',
		408: '#e121d2',
		401: '#b92dae',
		405: '#f47ceb',
		404: '#a82a9f',
		400: '#b263c6',
		301: '#6fa024',
		302: '#87c32b',
		307: '#a0d84c',
		304: '#28b55c',
		200: '#1a4f74',
		206: '#27839f',
		201: '#52adc9',
		202: '#7c979f',
		203: '#a5b8bd',
		204: '#c1cdd1'
	};

	this.schemes.colorwheel = [
		'#b5b6a9',
		'#858772',
		'#785f43',
		'#96557e',
		'#4682b4',
		'#65b9ac',
		'#73c03a',
		'#cb513a'
	].reverse();

	this.schemes.cool = [
		'#5e9d2f',
		'#73c03a',
		'#4682b4',
		'#7bc3b8',
		'#a9884e',
		'#c1b266',
		'#a47493',
		'#c09fb5'
	];
}
Rickshaw.namespace('Rickshaw.Fixtures.RandomData');

Rickshaw.Fixtures.RandomData = function(timeInterval) {

	var addData;
	timeInterval = timeInterval || 1;

	var lastRandomValue = 200;

	var timeBase = Math.floor(new Date().getTime() / 1000);

	this.addData = function(data) {

		var randomValue = Math.random() * 100 + 15 + lastRandomValue;
		var index = data[0].length;

		var counter = 1;

		data.forEach( function(series) {
			var randomVariance = Math.random() * 20;
			var v = randomValue / 25  + counter++
				+ (Math.cos((index * counter * 11) / 960) + 2) * 15 
				+ (Math.cos(index / 7) + 2) * 7
				+ (Math.cos(index / 17) + 2) * 1;

			series.push( { x: (index * timeInterval) + timeBase, y: v + randomVariance } );
		} );

		lastRandomValue = randomValue * .85;
	}
}

Rickshaw.namespace('Rickshaw.Fixtures.Time');

Rickshaw.Fixtures.Time = function() {

	var tzOffset = new Date().getTimezoneOffset() * 60;

	var self = this;

	this.months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	this.units = [
		{ 
			name: 'decade',
			seconds: 86400 * 365.25 * 10,
			formatter: function(d) { return (parseInt(d.getUTCFullYear() / 10) * 10) }
		}, { 
			name: 'year',
			seconds: 86400 * 365.25,
			formatter: function(d) { return d.getUTCFullYear() } 
		}, { 
			name: 'month',
			seconds: 86400 * 30.5,
			formatter: function(d) { return self.months[d.getUTCMonth()] }
		}, { 
			name: 'week',
			seconds: 86400 * 7, 
			formatter: function(d) { return self.formatDate(d) }
		}, { 
			name: 'day',
			seconds: 86400,
			formatter: function(d) { return d.getUTCDate() }
		}, { 
			name: '6 hour',
			seconds: 3600 * 6, 
			formatter: function(d) { return self.formatTime(d) }
		}, { 
			name: 'hour',
			seconds: 3600, 
			formatter: function(d) { return self.formatTime(d) }
		}, { 
			name: '15 minute', 
			seconds: 60 * 15,
			formatter: function(d) { return self.formatTime(d) }
		}, { 
			name: 'minute', 
			seconds: 60,
			formatter: function(d) { return d.getUTCMinutes() }
		}, { 
			name: '15 second', 
			seconds: 15, 
			formatter: function(d) { return d.getUTCSeconds() + 's' }
		}, { 
			name: 'second', 
			seconds: 1, 
			formatter: function(d) { return d.getUTCSeconds() + 's' }
		}
	];

	this.unit = function(unitName) {
		return this.units.filter( function(unit) { return unitName == unit.name } ).shift();
	}

	this.formatDate = function(d) {
		return d.toUTCString().match(/, (\w+ \w+ \w+)/)[1];
	}

	this.formatTime = function(d) {
		return d.toUTCString().match(/(\d+:\d+):/)[1];
	}

	this.ceil = function(time, unit) {
		
		if (unit.name == 'month') {
			var nearFuture = new Date((time + unit.seconds - 1) * 1000);
			return new Date(nearFuture.getUTCFullYear(), nearFuture.getUTCMonth() + 1, 1, 0, 0, 0, 0).getTime() / 1000;
		} 

		if (unit.name == 'year') {
			var nearFuture = new Date((time + unit.seconds - 1) * 1000);
			return new Date(nearFuture.getUTCFullYear(), 1, 1, 0, 0, 0, 0).getTime() / 1000;
		}

		return Math.ceil(time / unit.seconds) * unit.seconds;
	}
}
Rickshaw.namespace('Rickshaw.Fixtures.Number');

Rickshaw.Fixtures.Number.formatKMBT = function(y) {
	if (y >= 1000000000000)   { return y / 1000000000000 + "T" } 
	else if (y >= 1000000000) { return y / 1000000000 + "B" } 
	else if (y >= 1000000)    { return y / 1000000 + "M" } 
	else if (y >= 1000)       { return y / 1000 + "K" }
	else if (y < 1 && y > 0)  { return y.toFixed(2) }
	else if (y == 0)          { return '' }
	else                      { return y }
}
Rickshaw.namespace("Rickshaw.Color.Palette");

Rickshaw.Color.Palette = function(args) {

	var color = new Rickshaw.Fixtures.Color();

	args = args || {};
	this.schemes = {};

	this.scheme = color.schemes[args.scheme] || args.scheme || color.schemes.colorwheel;
	this.runningIndex = 0;

	this.color = function(key) {
		return this.scheme[key] || this.scheme[this.runningIndex++] || '#808080';
	}
}
Rickshaw.namespace('Graph.Ajax');

Rickshaw.Graph.Ajax = function(args) {

	var self = this;
	this.dataURL = args.dataURL;

	$.ajax( {
		url: this.dataURL,
		complete: function(response, status) {

			if (status === 'error') {
				console.log("error loading dataURL: " + this.dataURL);
			}

			var data = eval( '(' + response.responseText + ')' );	

			if (typeof args.onData === 'function') {
				var processedData = args.onData(data);
				data = processedData;
			}

			if (args.series) {

				args.series.forEach( function(s) {

					var seriesKey = s.key || s.name;
					if (!seriesKey) throw "series needs a key or a name";
					
					data.forEach( function(d) {

						var dataKey = d.key || d.name;
						if (!dataKey) throw "data needs a key or a name";
		
						if (seriesKey == dataKey) {
							var properties = ['color', 'name', 'data'];
							properties.forEach( function(p) {
								s[p] = s[p] || d[p];
							} );
						}
					} );
				} );

			} else {
				args.series = data;
			}

			self.graph = new Rickshaw.Graph(args);
			self.graph.render();

			if (typeof args.onComplete == 'function') {
				args.onComplete(self);
			}
		}
	} );
}

Rickshaw.namespace('Rickshaw.Graph.Annotate');

Rickshaw.Graph.Annotate = function(args) {

	var graph = this.graph = args.graph;
	this.elements = { timeline: args.element };
	
	var self = this;

	this.data = {};

	this.elements.timeline.classList.add('rickshaw_annotation_timeline');

	this.add = function(time, content) {
		self.data[time] = self.data[time] || {'boxes': []};
		self.data[time].boxes.push({content: content});
	}

	this.update = function() {

		for (var time in self.data) {

			var annotation = self.data[time];
			var left = self.graph.x(time);

			if (left > self.graph.x.range()[1]) {
				if (annotation.element) {
					annotation.element.style.display = 'none';
				}
				continue;
			}

			if (!annotation.element) {
				var element = annotation.element = document.createElement('div');
				element.classList.add('annotation');
				this.elements.timeline.appendChild(element);
				element.addEventListener('click', function(e) {
					element.classList.toggle('active');
					annotation.line.classList.toggle('active');
				}, false);
					
			}

			annotation.element.style.left = left + 'px';
			annotation.element.style.display = 'block';

			annotation.boxes.forEach( function(box) {

				var element = box.element;

				if (!element) {
					element = box.element = document.createElement('div');
					element.classList.add('content');
					element.innerHTML = box.content;
					annotation.element.appendChild(element);

					annotation.line = document.createElement('div');
					annotation.line.classList.add('annotation_line');
					self.graph.element.appendChild(annotation.line);
				}

				annotation.line.style.left = left + 'px';
			} );
		}
	}

	this.graph.onUpdate( function() { self.update() } );
}
Rickshaw.namespace('Rickshaw.Graph.Axis.Time');

Rickshaw.Graph.Axis.Time = function(args) {

	var self = this;

	this.graph = args.graph;
	this.elements = [];
	this.ticksTreatment = args.ticksTreatment || 'plain';
	this.fixedTimeUnit = args.timeUnit;

	var time = new Rickshaw.Fixtures.Time();

	this.appropriateTimeUnit = function() {

		var unit;
		var units = time.units;

		var domain = this.graph.x.domain();
		var rangeSeconds = domain[1] - domain[0];

		units.forEach( function(u) {
			if (Math.floor(rangeSeconds / u.seconds) >= 2) {
				unit = unit || u;
			}
		} );

		return (unit || time.units[time.units.length - 1]);
	}

	this.tickOffsets = function() {

		var domain = this.graph.x.domain();

		var unit = this.fixedTimeUnit || this.appropriateTimeUnit();
		var count = Math.ceil((domain[1] - domain[0]) / unit.seconds);

		var runningTick = domain[0];

		var offsets = [];

		for (var i = 0; i < count; i++) {

			tickValue = time.ceil(runningTick, unit);
			runningTick = tickValue + unit.seconds / 2;

			offsets.push( { value: tickValue, unit: unit } );
		}

		return offsets;
	}

	this.render = function() {

		this.elements.forEach( function(e) {
			e.parentNode.removeChild(e);
		} );

		this.elements = [];

		var offsets = this.tickOffsets();

		offsets.forEach( function(o) {
			
			if (self.graph.x(o.value) > self.graph.x.range()[1]) return;
	
			var element = document.createElement('div');
			element.style.left = self.graph.x(o.value) + 'px';
			element.classList.add('x_tick');
			element.classList.add(self.ticksTreatment);

			var title = document.createElement('div');
			title.classList.add('title');
			title.innerHTML = o.unit.formatter(new Date(o.value * 1000));
			element.appendChild(title);

			self.graph.element.appendChild(element);
			self.elements.push(element);

		} );
	}

	this.graph.onUpdate( function() { self.render() } );
};

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
	}

	this.graph.onUpdate( function() { self.render() } );
};

Rickshaw.namespace('Rickshaw.Graph.Behavior.Series.Highlight');

Rickshaw.Graph.Behavior.Series.Highlight = function(args) {

	this.graph = args.graph;
	this.legend = args.legend;

	var self = this;

	var colorSafe = {};

	this.addHighlightEvents = function (l) {
		l.element.addEventListener( 'mouseover', function(e) {

			self.legend.lines.forEach( function(line) {
				if (l === line) return;
				colorSafe[line.series.name] = colorSafe[line.series.name] || line.series.color;
				line.series.color = d3.interpolateRgb(line.series.color, d3.rgb('#d8d8d8'))(0.8).toString();
			} );

			self.graph.update();

		}, false );

		l.element.addEventListener( 'mouseout', function(e) {

			self.legend.lines.forEach( function(line) {
				if (colorSafe[line.series.name]) {
					line.series.color = colorSafe[line.series.name];
				}
			} );

			self.graph.update();

		}, false );
	}

	if (this.legend) {
		this.legend.lines.forEach( function(l) {
			self.addHighlightEvents(l);
		} );
	}

}
Rickshaw.namespace('Rickshaw.Graph.Behavior.Series.Order');

Rickshaw.Graph.Behavior.Series.Order = function(args) {

	this.graph = args.graph;
	this.legend = args.legend;

	var self = this;

	$(function() {
		$(self.legend.list).sortable( { 
			containment: 'parent',
			tolerance: 'pointer',
			update: function( event, ui ) {
				var series = [];
				$(self.legend.list).find('li').each( function(index, item) {
					if (!item.series) return;
					series.push(item.series);
				} );

				for (var i = self.graph.series.length - 1; i >= 0; i--) {
					self.graph.series[i] = series.shift();
				}

				self.graph.update();
			}
		} );
		$(self.legend.list).disableSelection();
	});

	//hack to make jquery-ui sortable behave
	this.graph.onUpdate( function() { 
		var h = window.getComputedStyle(self.legend.element).height;
		self.legend.element.style.height = h;
	} );
}
Rickshaw.namespace('Rickshaw.Graph.Behavior.Series.Toggle');

Rickshaw.Graph.Behavior.Series.Toggle = function(args) {

	this.graph = args.graph;
	this.legend = args.legend;

	var self = this;

	this.addAnchor = function(line) {
		var anchor = document.createElement('a');
		anchor.innerHTML = '&#10004;';
		anchor.classList.add('action');
		line.element.insertBefore(anchor, line.element.firstChild);

		anchor.onclick = function(e) {
			if (line.series.disabled) {
				line.series.enable();
				line.element.classList.remove('disabled');
			} else { 
				line.series.disable();
				line.element.classList.add('disabled');
			}
		}
	}

	if (this.legend) {

		this.legend.lines.forEach( function(l) {
			self.addAnchor(l);
		} );
	}

	this._addBehavior = function() {

		this.graph.series.forEach( function(s) {
			
			s.disable = function() {

				if (self.graph.series.length <= 1) {
					throw('only one series left');
				}
				
				s.disabled = true;
				self.graph.update();
			}

			s.enable = function() {
				s.disabled = false;
				self.graph.update();
			}
		} );
	}
	this._addBehavior();

	this.updateBehaviour = function () { this._addBehavior() }

}
Rickshaw.namespace('Rickshaw.Graph.HoverDetail');

Rickshaw.Graph.HoverDetail = function(args) {

	var graph = this.graph = args.graph;
	
	var element = this.element = document.createElement('div');
	element.className = 'detail';
	
	this.visible = true;

	graph.element.appendChild(element);

	var self = this;

	this.lastEvent = null;

	this.update = function(e) {

		e = e || this.lastEvent;
		if (!e) return;
		this.lastEvent = e;

		if (e.target.nodeName != 'path' && e.target.nodeName != 'svg') return;

		var eventX = e.offsetX || e.layerX;
		var eventY = e.offsetY || e.layerY;

		var domainX = graph.x.invert(eventX);
		var stackedData = graph.stackedData;

		var topSeriesData = stackedData.slice(-1).shift();

		var domainIndexScale = d3.scale.linear()
			.domain([topSeriesData[0].x, topSeriesData.slice(-1).shift().x])
			.range([0, topSeriesData.length]);

		var approximateIndex = Math.floor(domainIndexScale(domainX));
		var dataIndex = approximateIndex || 0;

		for (var i = approximateIndex; i < stackedData[0].length - 1;) {

			if (stackedData[0][i].x <= domainX && stackedData[0][i + 1].x > domainX) {
				dataIndex = i;
				break;
			}
			if (stackedData[0][i + 1] < domainX) { i++ } else { i-- }
		}

		domainX = stackedData[0][dataIndex].x;

		var detail = graph.series.active()
			.map( function(s) { return { name: s.name, value: s.stack[dataIndex] } } );

		if (this.visible) {
			self.render.call( self, domainX, detail, eventX, eventY);
		}
	}

	this.xFormatter = function(x) {
		return new Date( x * 1000 ).toUTCString();
	}

	this.graph.element.addEventListener( 
		'mousemove', 
		function(e) { 
			self.visible = true; 
			self.update(e) 
		}, 
		false 
	);

	this.graph.onUpdate( function() { self.update() } );

	this.graph.element.addEventListener( 
		'mouseout', 
		function(e) { 
			if (e.relatedTarget && !(e.relatedTarget.compareDocumentPosition(self.graph.element) & Node.DOCUMENT_POSITION_CONTAINS)) {
				self.hide();
			}
		 }, 
		false 
	);

	this.hide = function() {
		this.visible = false;
		this.element.classList.add('inactive');
	}

	this.show = function() {
		this.visible = true;
		this.element.classList.remove('inactive');
	}

	this.render = function(domainX, detail, mouseX, mouseY) {

		this.element.innerHTML = '';
		this.element.style.left = graph.x(domainX) + 'px';

		var xLabel = document.createElement('div');
		xLabel.className = 'x_label';
		xLabel.innerHTML = this.xFormatter(domainX);
		this.element.appendChild(xLabel);

		var activeItem = null;

		var sortFn = function(a, b) {
			return (a.value.y0 + a.value.y) - (b.value.y0 + b.value.y);
		}

		detail.sort(sortFn).forEach( function(d) {

			var item = document.createElement('div');
			item.className = 'item';
			item.innerHTML = d.name + ':&nbsp;' + d.value.y.toFixed(2);
			item.style.top = graph.y(d.value.y0 + d.value.y) + 'px';

			var domainMouseY = graph.y.magnitude.invert(graph.element.offsetHeight - mouseY);
			
			this.element.appendChild(item);

			var dot = document.createElement('div');
			dot.className = 'dot';
			dot.style.top = item.style.top;

			this.element.appendChild(dot);

			if (domainMouseY > d.value.y0 && domainMouseY < d.value.y0 + d.value.y && !activeItem) {

				activeItem = item;
				item.className = 'item active';	
				dot.className = 'dot active';
			}

		}, this );

		this.show();
	}
}

Rickshaw.namespace('Rickshaw.Graph.JSONP');

Rickshaw.Graph.JSONP = function(args) {

	var self = this;
	this.dataURL = args.dataURL;

	$.ajax( {
		url: this.dataURL,
		dataType: 'jsonp',
		success: function(data, status, response) {

			if (status === 'error') {
				console.log("error loading dataURL: " + this.dataURL);
			}

			if (typeof args.onData === 'function') {
				var processedData = args.onData(data);
				data = processedData;
			}

			if (args.series) {

				args.series.forEach( function(s) {

					var seriesKey = s.key || s.name;
					if (!seriesKey) throw "series needs a key or a name";
					
					data.forEach( function(d) {

						var dataKey = d.key || d.name;
						if (!dataKey) throw "data needs a key or a name";
		
						if (seriesKey == dataKey) {
							var properties = ['color', 'name', 'data'];
							properties.forEach( function(p) {
								s[p] = s[p] || d[p];
							} );
						}
					} );
				} );

			} else {
				args.series = data;
			}

			self.graph = new Rickshaw.Graph(args);
			self.graph.render();

			if (typeof args.onComplete == 'function') {
				args.onComplete(self);
			}
		}
	} );
}

Rickshaw.namespace('Rickshaw.Graph.Legend');

Rickshaw.Graph.Legend = function(args) {

	var element = this.element = args.element;
	var graph = this.graph = args.graph;

	var self = this;

	element.classList.add('rickshaw_legend');

	var list = this.list = document.createElement('ul');
	element.appendChild(list);
	
	var series = graph.series
		.map( function(s) { return s } )
		.reverse();

	this.lines = [];

	this.addLine = function (series) {
		var line = document.createElement('li');
		line.className = 'line';

		var swatch = document.createElement('div');
		swatch.className = 'swatch';
		swatch.style.backgroundColor = series.color;

		line.appendChild(swatch);

		var label = document.createElement('span');
		label.className = 'label';
		label.innerHTML = series.name;

		line.appendChild(label);
		list.appendChild(line);

		line.series = series;

		if (series.noLegend) {
			line.style.display = 'none';
		}

		var _line = { element: line, series: series };
		if (self.shelving) {
			self.shelving.addAnchor(_line);
			self.shelving.updateBehaviour();
		}
		if (self.highlighter) {
			self.highlighter.addHighlightEvents(_line);
		}
		self.lines.push(_line);
	}

	series.forEach( function(s) {
		self.addLine(s);
	} );

	graph.onUpdate( function() {
		
	} );
}
Rickshaw.namespace('Rickshaw.Graph.RangeSlider');

Rickshaw.Graph.RangeSlider = function(args) {

	var element = this.element = args.element;
	var graph = this.graph = args.graph;

	$( function() {
		$(element).slider( {

			range: true,
			min: graph.dataDomain()[0],
			max: graph.dataDomain()[1],
			values: [ 
				graph.dataDomain()[0],
				graph.dataDomain()[1],
			],
			slide: function( event, ui ) {

				graph.window.xMin = ui.values[0];
				graph.window.xMax = ui.values[1];
				graph.update();

				// if we're at an extreme, stick there
				if (graph.dataDomain()[0] == ui.values[0]) {
					graph.window.xMin = undefined;
				}
				if (graph.dataDomain()[1] == ui.values[1]) {
					graph.window.xMax = undefined;
				}
			}
		} );
	} );

	element[0].style.width = graph.width + 'px';

	graph.onUpdate( function() {

		var values = $(element).slider('option', 'values');

		$(element).slider('option', 'min', graph.dataDomain()[0]);
		$(element).slider('option', 'max', graph.dataDomain()[1]);

		if (graph.window.xMin == undefined) {
			values[0] = graph.dataDomain()[0];
		}
		if (graph.window.xMax == undefined) {
			values[1] = graph.dataDomain()[1];
		}

		$(element).slider('option', 'values', values);

	} );
}

Rickshaw.namespace('Rickshaw.Graph.Renderer.Line');

Rickshaw.Graph.Renderer.Line = function(args) {

		var graph = this.graph = args.graph;
		var self = this;

		this.name = 'line';
		this.unstack = true;

		graph.unstacker = graph.unstacker || new Rickshaw.Graph.Unstacker( { graph: graph } );

		this.seriesPathFactory = function() { 

			return d3.svg.line()
				.x( function(d) { return graph.x(d.x) } )
				.y( function(d) { return graph.y(d.y) } )
				.interpolate(this.graph.interpolation).tension(0.8);
		}

		this.domain = function() {

			var values = [];
			var stackedData = graph.stackedData || graph.stackData();
	
			stackedData.forEach( function(series) {
				series.forEach( function(d) {
					values.push( d.y )
				} );
			} );

			var xMin = stackedData[0][0].x;
			var xMax = stackedData[0][ stackedData[0].length - 1 ].x;

			var yMin = 0;
			var yMax = d3.max( values );

			return { x: [xMin, xMax], y: [yMin, yMax] };
		}

		this.render = function() {

			graph.vis.selectAll('*').remove();

			var nodes = this.graph.vis.selectAll("path")
				.data(this.graph.stackedData)
				.enter().append("svg:path")
				.attr("d", this.seriesPathFactory()); 

			var i = 0;
			graph.series.forEach( function(series) {
				if (series.disabled) return;
				series.path = nodes[0][i++];
				self._styleSeries(series);
			} );
		}

		this._styleSeries = function(series) {
			series.path.setAttribute('fill', 'none');
			series.path.setAttribute('stroke', series.color);
			series.path.setAttribute('stroke-width', 2);
		}
}

Rickshaw.namespace('Rickshaw.Graph.Renderer.Stack');

Rickshaw.Graph.Renderer.Stack = function(args) {

		var graph = this.graph = args.graph;
		var self = this;

		this.name = 'stack';

		this.seriesPathFactory = function() { 

			return d3.svg.area()
				.x( function(d) { return graph.x(d.x) } )
				.y0( function(d) { return graph.y(d.y0) } )
				.y1( function(d) { return graph.y(d.y + d.y0)} )
				.interpolate(this.graph.interpolation).tension(0.8);
		}

		this.domain = function() {

			var stackedData = graph.stackedData || graph.stackData();

			var topSeriesData = stackedData.slice(-1).shift();

			var xMin = stackedData[0][0].x;
			var xMax = stackedData[0][ stackedData[0].length - 1 ].x;

			var yMin = 0;
			var yMax = d3.max( topSeriesData, function(d) { return d.y + d.y0 } );

			return { x: [xMin, xMax], y: [yMin, yMax] };
		}

		this.render = function() {

			graph.vis.selectAll('*').remove();

			var nodes = graph.vis.selectAll("path")
				.data(graph.stackedData)
				.enter().append("svg:path")
				.attr("d", this.seriesPathFactory()); 

			var i = 0;
			graph.series.forEach( function(series) {
				if (series.disabled) return;
				series.path = nodes[0][i++];
				self._styleSeries(series);
			} );

		}

		this._styleSeries = function(series) {
			if (!series.path) return;
			series.path.setAttribute('fill', series.color);
			series.path.setAttribute('stroke-width', 2);
			series.path.setAttribute('class', series.className);
		}
}
Rickshaw.namespace('Rickshaw.Graph.Renderer.Bar');

Rickshaw.Graph.Renderer.Bar = function(args) {

	var graph = this.graph = args.graph;
	var self = this;

	this.name = 'bar';
	this.gapSize = args.gapSize || 0.05;

	this.unstack = false;
	graph.unstacker = graph.unstacker || new Rickshaw.Graph.Unstacker( { graph: graph } );

	this.domain = function() {

		var values = [];
		var stackedData = graph.stackedData || graph.stackData();

		var topSeriesData = this.unstack ? stackedData : [ stackedData.slice(-1).shift() ];

		topSeriesData.forEach( function(series) {
			series.forEach( function(d) {
				values.push( d.y + d.y0 );
			} );
		} );

		var xMin = stackedData[0][0].x;
		var xMax = stackedData[0][ stackedData[0].length - 1 ].x;

		var yMin = 0;
		var yMax = d3.max( values );

		this._barWidth = null;

		return { x: [xMin, xMax], y: [yMin, yMax] };
	}

	this.barWidth = function() {

		if (this._barWidth) return this._barWidth;

		var stackedData = graph.stackedData || graph.stackData();
		var data = stackedData.slice(-1).shift();

		var intervalCounts = {};

		for (var i = 0; i < data.length - 1; i++) {
			var interval = data[i + 1].x - data[i].x;
			intervalCounts[interval] = intervalCounts[interval] || 0;
			intervalCounts[interval]++;
		}

		var frequentInterval = { count: 0 };

		d3.keys(intervalCounts).forEach( function(i) {
			if (frequentInterval.count < intervalCounts[i]) {

				frequentInterval = {
					count: intervalCounts[i],
					magnitude: i
				};
			}
		} );


		this._barWidth = this.graph.x(data[0].x + frequentInterval.magnitude * (1 - this.gapSize));

		return this._barWidth;
	}

	this.render = function() {

		graph.vis.selectAll('*').remove();

		var barsPerSlot = this.unstack ? this.graph.series.length : 1;
		var barWidth = this.barWidth();
		var barXOffset = 0;

		var activeSeriesCount = graph.series.filter( function(s) { return !s.disabled } ).length;
		var seriesBarWidth = this.unstack ? barWidth / activeSeriesCount : barWidth;

		graph.series.forEach( function(series) {

			if (series.disabled) return;

			var nodes = graph.vis.selectAll("path")
				.data(series.stack)
				.enter().append("svg:rect")
				.attr("x", function(d) { return graph.x(d.x) + barXOffset })
				.attr("y", function(d) { return graph.y(d.y0 + d.y) })
				.attr("width", seriesBarWidth)
				.attr("height", function(d) { return graph.y.magnitude(d.y) });

			Array.prototype.forEach.call(nodes[0], function(n) {
				n.setAttribute('fill', series.color);
			} );

			if (self.unstack) barXOffset += seriesBarWidth;

		} );
	}

	this._styleSeries = function(series) {
		if (!series.path) return;
		series.path.setAttribute('fill', series.color);
		series.path.setAttribute('stroke-width', 2);
		series.path.setAttribute('class', series.className);
	}
}
Rickshaw.namespace('Rickshaw.Graph.Renderer.Area');

Rickshaw.Graph.Renderer.Area = function(args) {

	var graph = this.graph = args.graph;
	var self = this;

	this.tension = 0.8;
	this.strokeWidth = 2;
	this.yBerth = 1.025;

	this.name = 'area';

	this.unstack = false;
	graph.unstacker = graph.unstacker || new Rickshaw.Graph.Unstacker( { graph: graph } );

	this.seriesPathFactory = function() { 

		return d3.svg.area()
			.x( function(d) { return graph.x(d.x) } )
			.y0( function(d) { return graph.y(d.y0) } )
			.y1( function(d) { return graph.y(d.y + d.y0)} )
			.interpolate(this.graph.interpolation).tension(this.tension)
	}

	this.seriesLineFactory = function() { 

		return d3.svg.line()
			.x( function(d) { return graph.x(d.x) } )
			.y( function(d) { return graph.y(d.y + d.y0)} )
			.interpolate(this.graph.interpolation).tension(this.tension)
	}

	this.domain = function() {

		var values = [];
		var stackedData = graph.stackedData || graph.stackData();

		var topSeriesData = this.unstack ? stackedData : [ stackedData.slice(-1).shift() ];

		topSeriesData.forEach( function(series) {
			series.forEach( function(d) {
				values.push( d.y + d.y0 );
			} );
		} );

		var xMin = stackedData[0][0].x;
		var xMax = stackedData[0][ stackedData[0].length - 1 ].x;

		var yMin = 0;
		var yMax = d3.max( values ) * this.yBerth;

		return { x: [xMin, xMax], y: [yMin, yMax] };
	}

	this.render = function() {

		graph.vis.selectAll('*').remove();

		var nodes = graph.vis.selectAll("path")
			.data(graph.stackedData)
			.enter().insert("svg:g", 'g')

		nodes.append("svg:path")
			.attr("d", this.seriesPathFactory())
			.attr("class", 'area');

		if (this.graph.stroke) {
			nodes.append("svg:path")
				.attr("d", this.seriesLineFactory())
				.attr("class", 'line');
		}
		
		var i = 0;
		graph.series.forEach( function(series) {
			if (series.disabled) return;
			series.path = nodes[0][i++];
			self._styleSeries(series);
		} );
	}

	this._styleSeries = function(series) {

		if (!series.path) return;

		d3.select(series.path).select('.area')
			.attr('fill', series.color);

		if (this.graph.stroke) {
			d3.select(series.path).select('.line')
				.attr('fill', 'none')
				.attr('stroke', series.stroke || d3.interpolateRgb(series.color, 'black')(0.125))
				.attr('stroke-width', this.strokeWidth);
		}

		if (series.className) {
			series.path.setAttribute('class', series.className);
		}
	}
}
Rickshaw.namespace('Rickshaw.Graph.Renderer.ScatterPlot');

Rickshaw.Graph.Renderer.ScatterPlot = function(args) {

		var graph = this.graph = args.graph;
		var self = this;

		this.name = 'scatterplot';
		this.unstack = true;
		this.dotSize = args.dotSize || 4;

		this.xBerth = 1.0125;
		this.yBerth = 1.0125;

		graph.unstacker = graph.unstacker || new Rickshaw.Graph.Unstacker( { graph: graph } );

		this.domain = function() {

			var values = [];
			var stackedData = graph.stackedData || graph.stackData();
	
			stackedData.forEach( function(series) {
				series.forEach( function(d) {
					values.push( d.y )
				} );
			} );

			var xMin = stackedData[0][0].x;
			var xMax = stackedData[0][ stackedData[0].length - 1 ].x;

			xMin -= (xMax - xMin) * (this.xBerth - 1);
			xMax += (xMax - xMin) * (this.xBerth - 1);

			var yMin = 0;
			var yMax = d3.max( values ) * this.yBerth;

			return { x: [xMin, xMax], y: [yMin, yMax] };
		}

		this.render = function() {

			graph.vis.selectAll('*').remove();

			graph.series.forEach( function(series) {

				if (series.disabled) return;

				var nodes = graph.vis.selectAll("path")
					.data(series.stack)
					.enter().append("svg:circle")
					.attr("cx", function(d) { return graph.x(d.x) })
					.attr("cy", function(d) { return graph.y(d.y) })
					.attr("r", this.dotSize);

				Array.prototype.forEach.call(nodes[0], function(n) {
					n.setAttribute('fill', series.color);
				} );

			}, this );
		}

		this._styleSeries = function(series) {
			if (!series.path) return;
			series.path.setAttribute('fill', series.color);
			series.path.setAttribute('stroke-width', 2);
			series.path.setAttribute('class', series.className);
		}
}
Rickshaw.namespace('Rickshaw.Graph.Smoother');

Rickshaw.Graph.Smoother = function(args) {

	this.graph = args.graph;
	this.element = args.element;

	var self = this;

	this.aggregationScale = 1;

	if (this.element) {

		$( function() {
			$(self.element).slider( {
				min: 1,
				max: 100,
				slide: function( event, ui ) {
					self.setScale(ui.value);
					self.graph.update();
				}
			} );
		} );
	}

	self.graph.stackData.hooks.data.push( {
		name: 'smoother',
		orderPosition: 50,
		f: function(data) {

			var aggregatedData = [];

			data.forEach( function(seriesData) {
				
				var aggregatedSeriesData = [];

				while (seriesData.length) {

					var avgX = 0, avgY = 0;
					var slice = seriesData.splice(0, self.aggregationScale);

					slice.forEach( function(d) {
						avgX += d.x / slice.length;
						avgY += d.y / slice.length;
					} );

					aggregatedSeriesData.push( { x: avgX, y: avgY } );
				}

				aggregatedData.push(aggregatedSeriesData);
			} );

			return aggregatedData;
		}
	} );

	this.setScale = function(scale) {

		if (scale < 1) {
			throw "scale out of range: " + scale;
		}

		this.aggregationScale = scale;
		this.graph.update();
	}
}

Rickshaw.namespace('Rickshaw.Graph.Unstacker');

Rickshaw.Graph.Unstacker = function(args) {

	this.graph = args.graph;
	var self = this;

	this.graph.stackData.hooks.after.push( {
		name: 'unstacker',
		f: function(data) {

			if (!self.graph.renderer.unstack) return data;

			data.forEach( function(seriesData) {
				seriesData.forEach( function(d) {
					d.y0 = 0;
				} );
			} );

			return data;
		}
	} );
}

Rickshaw.namespace('Rickshaw.Series');

Rickshaw.Series = function(data, palette, options) {

	this.initialize(data, palette, options);
}

Rickshaw.Series.prototype = new Array;

Rickshaw.Series.prototype.constructor = Rickshaw.Series;

Rickshaw.Series.prototype.initialize = function (data, palette, options) {
	var self = this;
	options = options || {}

	self.palette = new Rickshaw.Color.Palette(palette);
	self.timeBase = typeof(options.timeBase) === 'undefined' ? Math.floor(new Date().getTime() / 1000) : options.timeBase;

	if (data && (typeof(data) == "object") && (data instanceof Array)) {
		data.forEach( function (item) { self.addItem(item) } );
	}
}

Rickshaw.Series.prototype.addItem = function(item) {
	var self = this;
	if (typeof(item.name) === 'undefined') {
		throw('addItem() needs a name');
	}

	item.color = (item.color || self.palette.color(item.name));
	item.data = (item.data || []);

	// backfill, if necessary
	if ((item.data.length == 0) && (self.getIndex() > 0)) {
		self[0].data.forEach( function (plot) {
			item.data.push({ x: plot.x, y: 0 });
		} );
	} else {
		// otherwise add a first plot
		console.log(self.timeBase);
		item.data.push({ x: self.timeBase, y: 0 });
	}

	self.push(item);

	if (self.legend) {
		self.legend.addLine(self.itemByName(item.name));
	}
}

Rickshaw.Series.prototype.addData = function(data) {
	var self = this;
	var index = this.getIndex();

	Rickshaw.keys(data).forEach( function (name) {
		if (! self.itemByName(name)) {
			self.addItem({ name: name });
		}
	} );

	self.forEach( function (item) {
		item.data.push({ x: (index * self.timeInterval || 1) + self.timeBase, y: (data[item.name] || 0) });
	} );
}

Rickshaw.Series.prototype.getIndex = function () {
	var self = this;
	return (self[0] && self[0].data && self[0].data.length) ? self[0].data.length : 0;
}

Rickshaw.Series.prototype.itemByName = function (name) {
	var self = this;
	var ret;
	self.forEach( function (item) {
		if (item.name == name) { ret = item }
	} );
	return ret;
}

Rickshaw.Series.prototype.setTimeInterval = function (iv) {
	this.timeInterval = parseInt(iv/1000);
}

Rickshaw.Series.prototype.setTimeBase = function (t) {
	this.timeBase = t;
}

Rickshaw.Series.prototype.dump = function () {
	var self = this;
	var data = {
		timeBase: self.timeBase,
		timeInterval: self.timeInterval,
		items: [],
	};
	self.forEach( function (item) {
		var newItem = {
			color: item.color,
			name: item.name,
			data: []
		};

		item.data.forEach( function (plot) {
			newItem.data.push({ x: plot.x, y: plot.y });
		} );

		data.items.push(newItem);
	} );
	return data;
}

Rickshaw.Series.prototype.load = function (data) {
	var self = this;
	if (data.timeInterval) {
		self.timeInterval = data.timeInterval;
	}

	if (data.timeBase) {
		self.timeBase = data.timeBase;
	}

	if (data.items) {
		data.items.forEach( function (item) {
			self.push(item);

			if (self.legend) {
				self.legend.addLine(self.itemByName(item.name));
			}
		} );
	}
}

Rickshaw.Series.zeroFill = function(series) {

	var x;
	var i = 0;

	var data = series.map( function(s) { return s.data } );

	while ( i < Math.max.apply(null, data.map( function(d) { return d.length } )) ) {

		x = Math.min.apply( null, 
			data
				.filter(function(d) { return d[i] })
				.map(function(d) { return d[i].x })
		);

		data.forEach( function(d) {
			if (!d[i] || d[i].x != x) {
				d.splice(i, 0, { x: x, y: 0 });
			}
		} );

		i++;
	}
};
