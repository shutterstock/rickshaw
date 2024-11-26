var Rickshaw = require("../rickshaw");

function seriesData() {
	return {
		name: 'series1',
		data: [ {x: 0, y: 20}, {x: 1, y: 21}, { x: 2, y: 15} ],
		color: 'red'
	};
}

exports.basic = function(test) {

	test.equal(typeof Rickshaw.Series, 'function', 'Rickshaw.Series is a function');
	test.done();
};

exports.initialize = function(test) {

	var series = new Rickshaw.Series([seriesData()], 'spectrum2001', {timeBase: 0});

	test.ok(series instanceof Rickshaw.Series);
	test.ok(series instanceof Array);

	test.deepEqual(
		series[0].data,
		[ { x: 0, y: 20 },
			{ x: 1, y: 21 },
			{ x: 2, y: 15 } ],
		'data made it in as we expect'
	);

	test.done();
};

exports.addItem = function(test) {

	var series = new Rickshaw.Series([seriesData()], 'spectrum2001', {timeBase: 0});

	series.addItem( {
		name: 'series2',
		data: [ {x: 0, y: 10}, {x: 1, y: 13}, {x: 2, y: 12} ]
	} );

	test.equal(series.length, 2, 'series has two items');
	test.done();
};

exports.addData = function(test) {

	var series = new Rickshaw.Series([seriesData()], 'spectrum2001', {timeBase: 0});

	series.addData( { series1: 22 } );

	test.equal(series[0].data.length, 4, 'first series has four data points');
	test.equal(series[0].data[3].y, 22, 'first series last data point made it in');

	series.addData( { series1: 29, series2: 57 } );

	test.equal(series[0].data[4].y, 29, 'first series has a new data point');

	test.equal(series[1].data.length, 5, 'second series has five data points');
	test.equal(series[1].data[4].y, 57, 'second series last data point made it in');

	test.done();
};

exports.addDataWithXAxisValue = function(test) {

	var series = new Rickshaw.Series([seriesData()], 'spectrum2001', {timeBase: 0});

	series.addData({ series1: 22 }, 5);

	test.equal(series[0].data.length, 4, 'first series has four data points');
	test.equal(series[0].data[3].y, 22, 'first series last data point made it in');
	test.equal(series[0].data[3].x, 5, 'first series last data point made it in with the correct x');

	series.addData({ series1: 29, series2: 57 }, 7);

	test.equal(series[0].data[4].y, 29, 'first series has a new data point');
	test.equal(series[0].data[4].x, 7, 'first series has a new data point with the correct x');

	test.equal(series[1].data.length, 5, 'second series has five data points');
	test.equal(series[1].data[4].y, 57, 'second series last data point made it in');
	test.equal(series[1].data[4].x, 7, 'second series last data point made it in with the correct x');

	test.done();
};

exports.itemByName = function(test) {

	var series = new Rickshaw.Series([seriesData()], 'spectrum2001', {timeBase: 0});

	test.strictEqual(series.itemByName('series1'), series[0], 'we get the right item');
	test.strictEqual(series.itemByName('series1').name, 'series1', 'item by name is right');
	test.done();
};

exports.dump = function(test) {

	var series = new Rickshaw.Series([seriesData()], 'spectrum2001', {timeBase: 0});

	test.deepEqual(
		series.dump(),
		{
			"timeBase":0,
			"timeInterval": 1,
			"items":[{
				"color":"red",
				"name":"series1",
				"data":[{"x":0,"y":20},{"x":1,"y":21},{"x":2,"y":15}]
			}]
		},
		'dumped series matches'
	);

	test.done();
};

exports.zeroFill = function(test) {

	var series = [
		{ name: "series1", data: [{ x: 1, y: 22 }, { x: 3, y: 29 }] },
		{ name: "series2", data: [{ x: 2, y: 49 }] }
	];

	Rickshaw.Series.zeroFill(series);

	var expectedSeries = [
		{ name: "series1", data: [{ x: 1, y: 22 }, { x: 2, y: 0 }, { x: 3, y: 29 }] },
		{ name: "series2", data: [{ x: 1, y: 0}, { x: 2, y: 49 }, { x: 3, y: 0 }] }
	];

	test.deepEqual(series, expectedSeries, "zero fill fills in zeros");
	test.done();
};

exports.nullFill = function(test) {

	var series = [
		{ name: "series1", data: [{ x: 1, y: 22 }, { x: 3, y: 29 }] },
		{ name: "series2", data: [{ x: 2, y: 49 }] }
	];

	Rickshaw.Series.fill(series, null);

	var expectedSeries = [
		{ name: "series1", data: [{ x: 1, y: 22 }, { x: 2, y: null }, { x: 3, y: 29 }] },
		{ name: "series2", data: [{ x: 1, y: null}, { x: 2, y: 49 }, { x: 3, y: null }] }
	];

	test.deepEqual(series, expectedSeries, "null fill fills in nulls");
	test.done();
};

exports.load = function(test) {

	var series = new Rickshaw.Series([], 'spectrum2001', {timeBase: 0});

	series.load({
		items: [ seriesData() ],
		timeInterval: 3,
		timeBase: 0
	});

	delete series.palette;

	test.equal(series.timeBase, 0, 'time base made it in');
	test.equal(series.timeInterval, 3, 'time interval made it in');
	test.equal(series[0].data.length, 3, 'series data made it in');
	test.done();
};
