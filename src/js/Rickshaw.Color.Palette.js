Rickshaw.namespace("Rickshaw.Color.Palette");

Rickshaw.Color.Palette = function(args) {

	var color = new Rickshaw.Fixtures.Color();

	args = args || {};
	this.schemes = {};

	this.scheme = color.schemes[args.scheme] || args.scheme || color.schemes.colorwheel;
	this.runningIndex = 0;
	this.generatorIndex = 0;
  this.rotateCount = this.scheme.length;

	this.color = function(key) {
		return this.scheme[key] || this.scheme[this.runningIndex++] || this.interpolateColor() || '#808080';
	};

  this.interpolateColor = function() {
    var color;
    if (this.generatorIndex == this.rotateCount * 2 - 1) {
      color = d3.interpolateHsl(this.scheme[this.generatorIndex], this.scheme[0])(0.5);
      this.generatorIndex = 0;
      this.rotateCount *= 2;
    } else {
      color = d3.interpolateHsl(this.scheme[this.generatorIndex], this.scheme[this.generatorIndex + 1])(0.5);
      this.generatorIndex++;
    }
    this.scheme.push(color);
    return color;
  };

};
