window.Rickshaw = window.Rickshaw || {};
Rickshaw.Fixtures = Rickshaw.Fixtures || {};

Rickshaw.Fixtures.RandomData = function(timeInterval) {

	var addData;
	timeInterval = timeInterval || 1;

	var lastRandomValue = 3;

	var timeBase = Math.floor(new Date().getTime() / 1000);

	this.addData = function(data) {

		var randomValue = Math.random() * 100 + 15 + lastRandomValue;
		var index = data[0].length;

		var counter = 1;

		data.forEach( function(series) {
			var randomVariance = Math.random() * 10;
			var v = randomValue * counter++;
			series.push( { x: (index * timeInterval) + timeBase, y: v + randomVariance } );
		} );

		lastRandomValue = randomValue * .85;
	}
}

