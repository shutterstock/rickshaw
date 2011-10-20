if (typeof module !== 'undefined' && module.exports && typeof window === 'undefined') {
	window = module.exports;
}

window.Rickshaw = window.Rickshaw || {};

window.d3 = window.d3 || {};
window.d3.keys = function(map) {
	var keys = [];
	for (var key in map) keys.push(key);
	return keys;
};

window.Rickshaw.Series = function(data) {

	var self = this;

	this.initialize = function (data, palette, options) {
		options = options || {}

		self.palette = new window.Rickshaw.Color.Palette(palette);
		self.timeBase = typeof(options.timeBase) === 'undefined' ? Math.floor(new Date().getTime() / 1000) : options.timeBase;

		if (data && (typeof(data) == "object") && (data instanceof Array)) {
			data.forEach( function (item) { self.addItem(item) } );
		}
	}

	this.addItem = function(item) {
		if (typeof(item.name) === 'undefined') {
			throw('addItem() needs a name');
		}
		
		item.color = (item.color || self.palette.color());
		item.data = (item.data || []);

		// backfill, if necissary
		if ((item.data.length == 0) && (self.getIndex() > 0)) {
			self[0].data.forEach( function (plot) {
				item.data.push({ x: plot.x, y: 0 });
			} );
		} else {
			// otherwise add a first plot
			item.data.push({ x: self.timeBase, y: 0 });
		}

		self.push(item);

		if (self.legend) {
			self.legend.addLine(self.itemByName(item.name));
		}
	}

	this.addData = function(data) {
		var index = this.getIndex();

		window.d3.keys(data).forEach( function (name) {
			if (! self.itemByName(name)) {
				self.addItem({ name: name });
			}
		} );

		self.forEach( function (item) {
			item.data.push({ x: (index * self.timeInterval || 1) + self.timeBase, y: (data[item.name] || 0) });
		} );
	}

	this.getIndex = function () {
		return (self[0] && self[0].data && self[0].data.length) ? self[0].data.length : 0;
	}

	this.itemByName = function (name) {
		var ret;
		self.forEach( function (item) {
			if (item.name == name) { ret = item }
		} );
		return ret;
	}

	this.setTimeInterval = function (iv) {
		self.timeInterval = parseInt(iv/1000);
	}

	this.setTimeBase = function (t) {
		self.timeBase = t;
	}

	this.dump = function () {
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

	this.load = function (data) {
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

	this.initialize(data);
}

window.Rickshaw.Series.prototype = new Array;
