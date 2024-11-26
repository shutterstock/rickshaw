process.env.TZ = 'America/New_York';

var Rickshaw = require('../rickshaw');

var time = new Rickshaw.Fixtures.Time.Local;

exports.monthBoundary = function(test) {

	var february = 1359694800;
	var ceil = time.ceil(february, time.unit('month'));

	test.equal(ceil, february, "february resolves to itself");
	test.done();
};

exports.monthMinus = function(test) {

	var february = 1359694800;
	var ceil = time.ceil(february - 1, time.unit('month'));

	test.equal(ceil, february, "just before february resolves up to february");
	test.done();
};

exports.month = function(test) {

	var february = 1359694800;
	var march = 1362114000;

	var ceil = time.ceil(february + 1, time.unit('month'));

	test.equal(ceil, march, "february plus a bit resolves to march");
	test.done();
};

exports.decemberMonthWrap = function(test) {

	var december2013 = 1385874000;
	var january2014 = 1388552400;

	var ceil = time.ceil(december2013 + 1, time.unit('month'));

	test.equal(ceil, january2014, "december wraps to next year");
	test.done();
};

exports.yearBoundary = function(test) {

	var year2013 = 1357016400;
	var ceil = time.ceil(year2013, time.unit('year'));

	test.equal(ceil, year2013, "midnight new year resolves to itself");
	test.done();
};

exports.year = function(test) {

	var year2013 = 1357016400;
	var year2014 = 1388552400;

	var ceil = time.ceil(year2013 + 1, time.unit('year'));

	test.equal(ceil, year2014, "midnight new year plus a bit resolves to next year");
	test.done();
};

