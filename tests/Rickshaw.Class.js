var Rickshaw = require('../rickshaw');

exports.load = function(test) {

	test.equal(typeof Rickshaw.Class, 'object', 'Rickshaw.Class is a function');
	test.done();
};

exports.instantiation = function(test) {

	Rickshaw.namespace('Rickshaw.Sample.Class');

	Rickshaw.Sample.Class = Rickshaw.Class.create({
		name: 'sample',
		concat: function(suffix) {
			return [this.name, suffix].join(' ');
		}
	});

	var sample = new Rickshaw.Sample.Class();
	test.equal(sample.concat('polka'), 'sample polka');

	Rickshaw.namespace('Rickshaw.Sample.Class.Prefix');

	Rickshaw.Sample.Subclass = Rickshaw.Class.create( Rickshaw.Sample.Class, {
		name: 'sampler',
	});

	var sampler = new Rickshaw.Sample.Subclass();
	test.equal(sampler.concat('polka'), 'sampler polka');
	
	test.done();
};

exports.array = function(test) {

	Rickshaw.namespace('Rickshaw.Sample.Array');

	Rickshaw.Sample.Array = Rickshaw.Class.create(Array, {
		second: function() {
			return this[1];
		}
	});

	var array = new Rickshaw.Sample.Array();
	array.push('red');
	array.push('blue');

	test.equal(array.second(), 'blue');

	test.done();
};
