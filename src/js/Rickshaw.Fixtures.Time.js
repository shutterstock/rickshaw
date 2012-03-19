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
	};

	this.formatDate = function(d) {
		return d.toUTCString().match(/, (\w+ \w+ \w+)/)[1];
	};

	this.formatTime = function(d) {
		return d.toUTCString().match(/(\d+:\d+):/)[1];
	};

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
	};
};
