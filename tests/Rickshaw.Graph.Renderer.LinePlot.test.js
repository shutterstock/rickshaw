const Rickshaw = require('../rickshaw');

describe('Rickshaw.Graph.Renderer.LinePlot', () => {
  // Helper to create a fresh graph instance
  function createGraph(options = {}) {
    const element = document.createElement('div');
    document.body.appendChild(element);

    const defaultOptions = {
      element,
      width: 960,
      height: 500,
      renderer: 'lineplot',
      series: [{
        color: '#ff0000',
        data: [
          { x: 0, y: 20 },
          { x: 1, y: 25 },
          { x: 2, y: 15 }
        ]
      }, {
        color: '#00ff00',
        data: [
          { x: 0, y: 10 },
          { x: 1, y: 15 },
          { x: 2, y: 30 }
        ]
      }]
    };

    const graph = new Rickshaw.Graph({
      ...defaultOptions,
      ...options
    });

    return { graph, element };
  }

  afterEach(() => {
    // Clean up any elements added to document.body
    document.body.innerHTML = '';
  });

  test('has default settings', () => {
    const { graph } = createGraph();
    const renderer = new Rickshaw.Graph.Renderer.LinePlot({ graph });

    expect(renderer.name).toBe('lineplot');
    expect(renderer.dotSize).toBe(3);
    expect(renderer.strokeWidth).toBe(2);
    expect(renderer.unstack).toBe(true);
    expect(renderer.fill).toBe(false);
    expect(renderer.stroke).toBe(true);
    expect(renderer.padding).toEqual({
      top: 0.01,
      right: 0.01,
      bottom: 0.01,
      left: 0.01
    });
  });

  test('renders paths for each series', () => {
    const { graph, element } = createGraph();
    graph.render();

    // Should have two paths (one for each series)
    const paths = element.querySelectorAll('path');
    expect(paths.length).toBe(2);

    // Each path should have a d attribute
    paths.forEach(path => {
      expect(path.hasAttribute('d')).toBe(true);
    });
  });

  test('renders circles for data points', () => {
    const { graph, element } = createGraph();
    graph.render();

    // Should have 6 circles (3 points × 2 series)
    const circles = element.querySelectorAll('circle');
    expect(circles.length).toBe(6);

    // Check circle attributes
    circles.forEach(circle => {
      expect(circle.hasAttribute('cx')).toBe(true);
      expect(circle.hasAttribute('cy')).toBe(true);
      expect(circle.getAttribute('r')).toBe('3'); // default dotSize
      expect(circle.getAttribute('fill')).toBe('white');
      expect(circle.getAttribute('stroke-width')).toBe('2'); // default strokeWidth
    });

    // First series circles
    const firstSeriesCircles = Array.from(circles).slice(0, 3);
    firstSeriesCircles.forEach(circle => {
      expect(circle.getAttribute('stroke')).toBe('#ff0000');
      expect(circle.getAttribute('data-color')).toBe('#ff0000');
    });

    // Second series circles
    const secondSeriesCircles = Array.from(circles).slice(3);
    secondSeriesCircles.forEach(circle => {
      expect(circle.getAttribute('stroke')).toBe('#00ff00');
      expect(circle.getAttribute('data-color')).toBe('#00ff00');
    });
  });

  test('respects custom dot size', () => {
    const { graph, element } = createGraph();
    graph.renderer.dotSize = 5;
    graph.render();

    const circles = element.querySelectorAll('circle');
    circles.forEach(circle => {
      expect(circle.getAttribute('r')).toBe('5');
    });
  });

  test('respects per-point dot size', () => {
    const { graph, element } = createGraph({
      series: [{
        color: '#ff0000',
        data: [
          { x: 0, y: 20, r: 7 },
          { x: 1, y: 25 },
          { x: 2, y: 15 }
        ]
      }, {
        color: '#00ff00',
        data: [
          { x: 0, y: 10 },
          { x: 1, y: 15, r: 4 },
          { x: 2, y: 30 }
        ]
      }]
    });
    graph.render();

    const circles = element.querySelectorAll('circle');
    expect(circles[0].getAttribute('r')).toBe('7');
    expect(circles[4].getAttribute('r')).toBe('4');
  });

  test('skips disabled series', () => {
    const { graph, element } = createGraph({
      series: [{
        color: '#ff0000',
        data: [
          { x: 0, y: 20 },
          { x: 1, y: 25 },
          { x: 2, y: 15 }
        ]
      }, {
        color: '#00ff00',
        disabled: true,
        data: [
          { x: 0, y: 10 },
          { x: 1, y: 15 },
          { x: 2, y: 30 }
        ]
      }]
    });
    graph.render();

    // Should only have one path and three circles
    const paths = element.querySelectorAll('path');
    const circles = element.querySelectorAll('circle');
    expect(paths.length).toBe(1);
    expect(circles.length).toBe(3);
  });

  test('handles null values', () => {
    const { graph, element } = createGraph({
      series: [{
        color: '#ff0000',
        data: [
          { x: 0, y: 20 },
          { x: 1, y: null },
          { x: 2, y: 15 }
        ]
      }, {
        color: '#00ff00',
        data: [
          { x: 0, y: 10 },
          { x: 1, y: 15 },
          { x: 2, y: 30 }
        ]
      }]
    });
    graph.render();

    // Should have 5 circles (2 points in first series + 3 points in second series)
    const circles = element.querySelectorAll('circle');
    expect(circles.length).toBe(5);

    // Path should still be rendered
    const paths = element.querySelectorAll('path');
    expect(paths.length).toBe(2);
  });

  test('uses graph interpolation', () => {
    const { graph } = createGraph();
    graph.interpolation = 'cardinal';

    const mockLine = {
      x: jest.fn().mockReturnThis(),
      y: jest.fn().mockReturnThis(),
      interpolate: jest.fn().mockReturnThis(),
      tension: jest.fn().mockReturnThis(),
      defined: jest.fn().mockReturnThis()
    };

    jest.spyOn(d3.svg, 'line').mockReturnValue(mockLine);
    graph.render();
    
    expect(mockLine.interpolate).toHaveBeenCalledWith('cardinal');
    d3.svg.line.mockRestore();
  });

  test('uses graph tension', () => {
    const { graph } = createGraph();
    graph.renderer.tension = 0.8;

    const mockLine = {
      x: jest.fn().mockReturnThis(),
      y: jest.fn().mockReturnThis(),
      interpolate: jest.fn().mockReturnThis(),
      tension: jest.fn().mockReturnThis(),
      defined: jest.fn().mockReturnThis()
    };

    jest.spyOn(d3.svg, 'line').mockReturnValue(mockLine);
    graph.render();
    
    expect(mockLine.tension).toHaveBeenCalledWith(0.8);
    d3.svg.line.mockRestore();
  });
});
