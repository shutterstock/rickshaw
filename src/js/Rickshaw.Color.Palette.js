if (typeof module !== 'undefined' && module.exports && typeof window === 'undefined') {
	window = module.exports;
}

window.Rickshaw.Color = window.Rickshaw.Color || {};

(function() {

var color = new window.Rickshaw.Fixtures.Color();

window.Rickshaw.Color.Palette = function(args) {

	args = args || {};
	this.schemes = {};

	this.scheme = color.schemes[args.scheme] || color.schemes.classic9;
	this.runningIndex = 0;

	this.color = function(key) {
		return this.scheme[this.runningIndex++] || '#808080';
	}
}

})();
