Rickshaw.namespace("Rickshaw.Color.Palette");

Rickshaw.Color.Palette = function(args) {

	var color = new Rickshaw.Fixtures.Color();

	args = args || {};
	this.schemes = {};

	this.scheme = color.schemes[args.scheme] || args.scheme || color.schemes.colorwheel;
	this.runningIndex = 0;

	this.color = function(key) {
		return this.scheme[key] || this.scheme[this.runningIndex++] || '#808080';
	};
};
