var Rickshaw;

exports.setUp = function(callback) {

	Rickshaw = require('../rickshaw');

	global.document = d3.select('html')[0][0].parentNode;
	global.window = document.defaultView;

	new Rickshaw.Compat.ClassList();

	var el = document.createElement("div");
	this.graph = new Rickshaw.Graph({
		element: el,
		width: 960,
		height: 500,
		renderer: 'stack',
		series: [
			{
				name: 'foo',
				data: [
					{ x: 4, y: 32 }
				]
			},
			{
				name: 'bar',
				data: [
					{ x: 4, y: 32 }
				]
			}
		]
	});
	this.legendEl = document.createElement("div");


	callback();
};

exports.tearDown = function(callback) {

	delete require.cache.d3;
	callback();
};

exports.rendersLegend = function(test) {
	var legend = new Rickshaw.Graph.Legend({
		graph: this.graph,
		element: this.legendEl
	});

	var items = this.legendEl.getElementsByTagName('li')
	test.equal(items.length, 2, "legend count")
	test.equal(items[1].getElementsByClassName('label')[0].innerHTML, "foo")
	test.equal(items[0].getElementsByClassName('label')[0].innerHTML, "bar")

	test.done();

};

exports.hasDefaultClassName = function(test) {
	var legend = new Rickshaw.Graph.Legend({
		graph: this.graph,
		element: this.legendEl
	});

	test.equal(this.legendEl.className, "rickshaw_legend")
	test.done();
};

exports.canOverrideClassName = function(test) {
    var MyLegend = Rickshaw.Class.create( Rickshaw.Graph.Legend, {
    	className: 'fnord'
    });
	var legend = new MyLegend({
		graph: this.graph,
		element: this.legendEl
	});

	test.equal(this.legendEl.className, "fnord")
	test.done();
};

