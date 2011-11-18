Rickshaw.namespace("Rickshaw.Color.Palette");

Rickshaw.Color.Palette = function(args) {

	var color = new Rickshaw.Fixtures.Color();

	args = args || {};
	this.schemes = {};

	this.scheme = color.schemes[args.scheme] || color.schemes.classic9;
	this.runningIndex = 0;

	this.color = function(key) {
		return this.scheme[key || this.runningIndex++] || '#808080';
	}
}
