const Rickshaw = require('../rickshaw');
const package = require('../package.json');

describe('Rickshaw', () => {
  describe('version', () => {
    test('should match package.json version', () => {
      expect(Rickshaw.version).toBe(package.version);
    });
  });

  describe('namespace', () => {
    test('should expose main components', () => {
      expect(Rickshaw.Graph).toBeDefined();
      expect(Rickshaw.Color).toBeDefined();
      expect(Rickshaw.Fixtures).toBeDefined();
      expect(Rickshaw.Class).toBeDefined();
    });

    test('should expose graph components', () => {
      expect(Rickshaw.Graph.Renderer).toBeDefined();
      expect(Rickshaw.Graph.RangeSlider).toBeDefined();
      expect(Rickshaw.Graph.HoverDetail).toBeDefined();
      expect(Rickshaw.Graph.Axis).toBeDefined();
    });

    test('should expose color utilities', () => {
      expect(Rickshaw.Color.Palette).toBeDefined();
      const palette = new Rickshaw.Color.Palette();
      expect(typeof palette.color).toBe('function');
      expect(typeof palette.interpolateColor).toBe('function');
    });
  });

  describe('Class', () => {
    test('should allow creating new classes', () => {
      const TestClass = Rickshaw.Class.create();
      expect(TestClass).toBeDefined();
      expect(typeof TestClass).toBe('function');
    });

    test('should support inheritance', () => {
      const ParentClass = Rickshaw.Class.create({
        initialize: function(name) {
          this.name = name;
        },
        getName: function() {
          return this.name;
        }
      });

      const ChildClass = Rickshaw.Class.create(ParentClass, {
        initialize: function($super, name, age) {
          $super(name);
          this.age = age;
        },
        getAge: function() {
          return this.age;
        }
      });

      const instance = new ChildClass('test', 25);
      expect(instance.getName()).toBe('test');
      expect(instance.getAge()).toBe(25);
    });

    test('should handle class extension', () => {
      const ParentClass = Rickshaw.Class.create({
        method1: function() { return 1; }
      });

      const ChildClass = Rickshaw.Class.create(ParentClass, {
        method2: function() { return 2; }
      });

      const instance = new ChildClass();
      expect(instance.method1()).toBe(1);
      expect(instance.method2()).toBe(2);
    });
  });
});
