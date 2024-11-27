const Rickshaw = require('../rickshaw');

describe('Rickshaw.Class', () => {
  test('should be defined as an object', () => {
    expect(typeof Rickshaw.Class).toBe('object');
  });

  describe('instantiation', () => {
    test('should create a basic class instance', () => {
      // Create fresh class definition for this test
      const TestClass = Rickshaw.Class.create({
        name: 'sample',
        concat: function(suffix) {
          return [this.name, suffix].join(' ');
        }
      });

      const sample = new TestClass();
      expect(sample.concat('polka')).toBe('sample polka');
    });

    test('should create a subclass instance', () => {
      // Create fresh parent class for this test
      const ParentClass = Rickshaw.Class.create({
        name: 'sample',
        concat: function(suffix) {
          return [this.name, suffix].join(' ');
        }
      });

      // Create fresh subclass for this test
      const SubClass = Rickshaw.Class.create(ParentClass, {
        name: 'sampler'
      });

      const sampler = new SubClass();
      expect(sampler.concat('polka')).toBe('sampler polka');
    });
  });

  describe('array inheritance', () => {
    test('should extend Array functionality', () => {
      // Create fresh array class for this test
      const TestArray = Rickshaw.Class.create(Array, {
        second: function() {
          return this[1];
        }
      });

      const array = new TestArray();
      array.push('red');
      array.push('blue');
      
      expect(array.second()).toBe('blue');
    });
  });
});
