Rickshaw.namespace('Rickshaw.Fixtures.Time.Local');

Rickshaw.Fixtures.Time.Local = function() {

	var tzOffset = new Date().getTimezoneOffset() * 60;

	var self = this;

	this.months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	this.units = [
		{
			name: 'decade',
			seconds: 86400 * 365.25 * 10,
			formatter: function(d) { return (parseInt(d.getFullYear() / 10, 10) * 10) }
		}, {
			name: 'year',
			seconds: 86400 * 365.25,
			formatter: function(d) { return d.getFullYear() }
		}, {
			name: 'month',
			seconds: 86400 * 30.5,
			formatter: function(d) { return self.months[d.getMonth()] }
		}, {
			name: 'week',
			seconds: 86400 * 7,
			formatter: function(d) { return self.formatDate(d) }
		}, {
			name: 'day',
			seconds: 86400,
			formatter: function(d) { return d.getDate() }
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
			formatter: function(d) { return d.getMinutes() }
		}, {
			name: '15 second',
			seconds: 15,
			formatter: function(d) { return d.getSeconds() + 's' }
		}, {
			name: 'second',
			seconds: 1,
			formatter: function(d) { return d.getSeconds() + 's' }
		}
	];

	this.unit = function(unitName) {
		return this.units.filter( function(unit) { return unitName == unit.name } ).shift();
	};

	this.formatDate = function(d) {
		return d3.time.format('%b %e')(d);
	};

	this.formatTime = function(d) {
		return d.toString().match(/(\d+:\d+):/)[1];
	};

	this.ceil = function(time, unit) {

		var nearFuture;
		var rounded;

		if (unit.name == 'day') {

			nearFuture = new Date((time + unit.seconds - 1) * 1000);

			rounded = new Date(0);
			rounded.setMilliseconds(0);
			rounded.setSeconds(0);
			rounded.setMinutes(0);
			rounded.setHours(0);
			rounded.setDate(nearFuture.getDate());
			rounded.setMonth(nearFuture.getMonth());
			rounded.setFullYear(nearFuture.getFullYear());

			return rounded.getTime() / 1000;
		}

		if (unit.name == 'month') {

			nearFuture = new Date((time + unit.seconds - 1) * 1000);

			rounded = new Date(0);
			rounded.setMilliseconds(0);
			rounded.setSeconds(0);
			rounded.setMinutes(0);
			rounded.setHours(0);
			rounded.setDate(1);
			rounded.setMonth(nearFuture.getMonth());
			rounded.setFullYear(nearFuture.getFullYear());

			return rounded.getTime() / 1000;
		}

		if (unit.name == 'year') {

			nearFuture = new Date((time + unit.seconds - 1) * 1000);

			rounded = new Date(0);
			rounded.setFullYear(nearFuture.getFullYear());
			rounded.setMilliseconds(0);
			rounded.setSeconds(0);
			rounded.setMinutes(0);
			rounded.setHours(0);
			rounded.setDate(1);
			rounded.setMonth(0);

			return rounded.getTime() / 1000;
		}

		return Math.ceil(time / unit.seconds) * unit.seconds;
	};
};
