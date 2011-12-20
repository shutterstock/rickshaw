Rickshaw.namespace('Rickshaw.Series.FixedDuration');

Rickshaw.Series.FixedDuration = function(data, palette, options) {

	this.initialize(data, palette, options);
}

Rickshaw.Series.FixedDuration.prototype = new Rickshaw.Series;

Rickshaw.Series.FixedDuration.prototype.constructor = Rickshaw.Series.FixedDuration;

Rickshaw.Series.FixedDuration.prototype.initialize = function (data, palette, options) {
	var self = this;
	options = options || {}

	if (typeof(options.timeInterval) === 'undefined') {
		throw('FixedDuration series requires timeInterval');
	}
	if (typeof(options.maxDataPoints) === 'undefined') {
		throw('FixedDuration series requires maxDataPoints');
	}

	self.palette = new Rickshaw.Color.Palette(palette);
	self.timeBase = typeof(options.timeBase) === 'undefined' ? Math.floor(new Date().getTime() / 1000) : options.timeBase;
	self.setTimeInterval(options.timeInterval);
	if (self[0] && self[0].data && self[0].data.length) {
		self.currentSize = self[0].data.length;
		self.currentIndex = self[0].data.length;
	} else {
		self.currentSize  = 0;
		self.currentIndex = 0;
	}
	self.maxDataPoints = options.maxDataPoints;

	// reset timeBase for zero-filled values if needed
	if ((typeof(self.maxDataPoints) !== 'undefined') && (self.currentSize < self.maxDataPoints)) {
		self.timeBase -= Math.floor((self.maxDataPoints - self.currentSize) * self.timeInterval);
	}

	if (data && (typeof(data) == "object") && (data instanceof Array)) {
		data.forEach( function (item) { self.addItem(item) } );
		self.currentSize  += 1;
		self.currentIndex += 1;
	}

	// zero-fill up to maxDataPoints size if we don't have that much data yet
	if ((typeof(self.maxDataPoints) !== 'undefined') && (self.currentSize < self.maxDataPoints)) {
		for (var i = self.maxDataPoints - self.currentSize; i > 0; i--) {
			self.currentSize  += 1;
			self.currentIndex += 1;
			self.forEach( function (item) {
					item.data.splice(1, 0, { x: (i * self.timeInterval || 1) + self.timeBase, y: 0 });
					} );
		}
	}
}

Rickshaw.Series.FixedDuration.prototype.addData = function(data) {
	// call the parent
	Rickshaw.Series.prototype.addData.call(this, data);
	this.currentSize += 1;
	this.currentIndex += 1;

	if (this.maxDataPoints !== undefined) {
		while (this.currentSize > this.maxDataPoints) {
			this.dropData();
		}
	}
}

Rickshaw.Series.FixedDuration.prototype.dropData = function() {
	var self = this;
	self.forEach( function(item) {
			item.data.splice(0, 1);
			} );
	self.currentSize -= 1;
}

Rickshaw.Series.FixedDuration.prototype.getIndex = function () {
	return this.currentIndex;
}
