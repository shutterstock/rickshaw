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
