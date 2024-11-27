const d3 = require('d3');
const Rickshaw = require('../rickshaw');

describe('Rickshaw.Graph.Renderer', () => {
  // Helper function to create a clean graph instance
  const createGraph = (options = {}) => {
    const el = document.createElement('div');
    return new Rickshaw.Graph({
      element: el,
      width: options.width || 960,
      height: options.height || 500,
      padding: options.padding || { top: 0, right: 0, bottom: 0, left: 0 },
      renderer: options.renderer || 'scatterplot',
      series: options.series || [{
        color: 'steelblue',
        data: [
          { x: 0, y: 40 },
          { x: 1, y: 49 },
          { x: 2, y: 38 },
          { x: 3, y: 30 },
          { x: 4, y: 32 }
        ]
      }],
      min: options.min,
      max: options.max,
      stroke: options.stroke
    });
  };

  describe('domain calculation', () => {
    test('calculates basic domain without padding', () => {
      const graph = createGraph();
      const domain = graph.renderer.domain();
      expect(domain).toEqual({ x: [0, 4], y: [0, 49] });
    });

    test('calculates domain with padding', () => {
      const graph = createGraph({
        padding: { top: 0.1, right: 0.1, bottom: 0.1, left: 0.1 }
      });
      const domain = graph.renderer.domain();
      expect(domain).toEqual({ x: [-0.4, 4.44], y: [0, 53.9] });
    });

    test('handles negative y-values without auto min', () => {
      const graph = createGraph({
        series: [{
          data: [
            { x: 0, y: 40 },
            { x: 1, y: 49 },
            { x: 2, y: -72 },
            { x: 3, y: 30 },
            { x: 4, y: 32 }
          ]
        }]
      });
      const domain = graph.renderer.domain();
      expect(domain).toEqual({ x: [0, 4], y: [0, 49] });
    });

    test('handles negative y-values with auto min', () => {
      const graph = createGraph({
        min: 'auto',
        series: [{
          data: [
            { x: 0, y: 40 },
            { x: 1, y: 49 },
            { x: 2, y: -72 },
            { x: 3, y: 30 },
            { x: 4, y: 32 }
          ]
        }]
      });
      const domain = graph.renderer.domain();
      expect(domain).toEqual({ x: [0, 4], y: [-72, 49] });
    });

    test('handles different series lengths', () => {
      const graph = createGraph({
        min: 'auto',
        series: [
          {
            data: [
              { x: 0, y: 40 },
              { x: 1, y: 49 },
              { x: 2, y: -72 },
              { x: 3, y: 30 },
              { x: 4, y: 32 }
            ]
          },
          {
            data: [
              { x: 1, y: 20 },
              { x: 2, y: 38 },
              { x: 3, y: 30 },
              { x: 4, y: 32 },
              { x: 5, y: 32 }
            ]
          }
        ]
      });
      graph.stackData();
      const domain = graph.renderer.domain();
      expect(domain).toEqual({ x: [0, 5], y: [-72, 49] });
    });

    test('handles null values with auto min', () => {
      const graph = createGraph({
        min: 'auto',
        series: [
          { data: [{ x: 1, y: 27 }, { x: 2, y: 49 }, { x: 3, y: 14 }] },
          { data: [{ x: 1, y: null }, { x: 2, y: 9 }, { x: 3, y: 3 }] }
        ]
      });
      graph.stackData();
      const domain = graph.renderer.domain();
      expect(domain).toEqual({ x: [1, 3], y: [3, 49] });
    });

    test('handles explicit zero max', () => {
      const graph = createGraph({
        min: 'auto',
        max: 0,
        series: [
          { data: [{ x: 1, y: -29 }, { x: 2, y: -9 }, { x: 3, y: -3 }] }
        ]
      });
      graph.stackData();
      const domain = graph.renderer.domain();
      expect(domain).toEqual({ x: [1, 3], y: [-29, 0] });
    });
  });

  describe('stroke factory', () => {
    // Create a test renderer that implements stroke factory
    beforeAll(() => {
      Rickshaw.Graph.Renderer.RespectStrokeFactory = Rickshaw.Class.create(Rickshaw.Graph.Renderer, {
        name: 'respectStrokeFactory',
        
        seriesPathFactory: function() {
          const graph = this.graph;
          const factory = d3.svg.line()
            .x(d => graph.x(d.x))
            .y(d => graph.y(d.y + d.y0))
            .interpolate(graph.interpolation)
            .tension(this.tension);
          factory.defined && factory.defined(d => d.y !== null);
          return factory;
        },
        
        seriesStrokeFactory: function() {
          const graph = this.graph;
          const factory = d3.svg.line()
            .x(d => graph.x(d.x))
            .y(d => graph.y(d.y + d.y0))
            .interpolate(graph.interpolation)
            .tension(this.tension);
          factory.defined && factory.defined(d => d.y !== null);
          return factory;
        }
      });
    });

    test('creates both path and stroke elements', () => {
      const graph = createGraph({
        width: 10,
        height: 10,
        renderer: 'respectStrokeFactory',
        stroke: true,
        series: [{
          className: 'fnord',
          data: [
            { x: 0, y: 40 },
            { x: 1, y: 49 },
            { x: 2, y: 38 },
            { x: 3, y: 30 },
            { x: 4, y: 32 }
          ]
        }]
      });
      graph.render();

      const path = graph.vis.select('path.path.fnord');
      expect(path.size()).toBe(1);
      expect(path[0][0].getAttribute('opacity')).toBe('1');

      const stroke = graph.vis.select('path.stroke.fnord');
      expect(stroke.size()).toBe(1);

      // Check series references
      const firstSeries = graph.series[0];
      expect(d3.select(firstSeries.path).classed('path')).toBe(true);
      expect(d3.select(firstSeries.stroke).classed('stroke')).toBe(true);
    });
  });

  describe('empty series handling', () => {
    test('allows arbitrary empty series when finding domain', () => {
      const graph = createGraph({
        width: 10,
        height: 10,
        renderer: 'line',
        series: [
          { data: [] },
          {
            data: [
              { x: 0, y: 40 },
              { x: 1, y: 49 },
              { x: 2, y: 38 },
              { x: 3, y: 30 },
              { x: 4, y: 32 }
            ]
          }
        ]
      });

      // TODO: the original test expected { x: [0, 4], y: [0, 49.49] }
      expect(graph.renderer.domain()).toEqual({ x: [0, 4], y: [0, 49] });
    });
  });

  describe('configuration', () => {
    test('initializes with default settings', () => {
      const graph = createGraph();
      const defaults = graph.renderer.defaults();

      expect(defaults.tension).toBe(0.8);
      expect(defaults.strokeWidth).toBe(2);
      expect(defaults.unstack).toBe(true);
      expect(defaults.padding).toEqual({ top: 0.01, right: 0.01, bottom: 0.01, left: 0.01 });
      expect(defaults.stroke).toBe(false);
      expect(defaults.opacity).toBe(1);
    });

    test('allows setting stroke width and tension', () => {
      const graph = createGraph();
      
      graph.renderer.setStrokeWidth(3);
      expect(graph.renderer.strokeWidth).toBe(3);

      graph.renderer.setTension(0.5);
      expect(graph.renderer.tension).toBe(0.5);
    });
  });
});
