var Rickshaw = require("../rickshaw");

function seriesData() {
	return {
		name: 'series1',
		data: [ {x: 0, y: 20}, {x: 1, y: 21}, { x: 2, y: 15} ],
		color: 'red'
	};
}

exports.basic = function(test) {

	test.equal(typeof Rickshaw.Series.FixedDuration, 'function', 'Rickshaw.Series.FixedDuration is a function');
	test.done();
};

exports.initialize = function(test) {

	function instantiateMalformed() {

		var series = new Rickshaw.Series.FixedDuration(
			[seriesData()], 
			'spectrum2001', 
			{ timeBase: 0, maxDataPoints: 2000 }
		);
	}

	test.throws(instantiateMalformed, 'FixedDuration series requires timeInterval', 'we die without a timeInterval');

	function instantiateMalformed() {

		var series = new Rickshaw.Series.FixedDuration(
			[seriesData()], 
			'spectrum2001', 
			{ timeBase: 0, timeInterval: 30 }
		);
	}

	test.throws(instantiateMalformed, 'FixedDuration series requires maxDataPoints', 'we die without maxDataPoints');

	var series = new Rickshaw.Series.FixedDuration(
		[seriesData()], 
		'spectrum2001', 
		{
			timeBase: 0,
			timeInterval: 30,
			maxDataPoints: 2000
		}
	);

	test.ok(series instanceof Rickshaw.Series.FixedDuration);
	test.ok(series instanceof Array);
	test.done();
}

exports.addData = function(test) {

	var series = new Rickshaw.Series.FixedDuration(
		[seriesData()], 
		'spectrum2001', 
		{
			timeBase: 0,
			timeInterval: 1,
			maxDataPoints: 20
		}
	);

	for (var i = 0; i < 300; i++) {
		series.addData({series1: 42});	
	}

	test.equal(series[0].data.length, 20 + 2, 'series length stuck around maxDataPoints');
	test.equal(series.currentSize, 20, 'series.currentSize is stuck at maxDataPoints');
	test.done();
}
