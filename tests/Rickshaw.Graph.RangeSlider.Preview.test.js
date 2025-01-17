const d3 = require('d3');
const Rickshaw = require('../rickshaw');

describe('Rickshaw.Graph.RangeSlider.Preview', () => {
  // Helper functions to create clean instances for each test
  const createTestElement = () => document.createElement('div');
  
  const createTestGraph = (options = {}) => {
    const graph = new Rickshaw.Graph({
      element: document.createElement('div'),
      width: options.width || 960,
      height: options.height || 500,
      renderer: options.renderer || 'scatterplot',
      series: [{
        color: options.color || 'steelblue',
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
    return graph;
  };

  test('throws error when required arguments are missing', () => {
    expect(() => {
      new Rickshaw.Graph.RangeSlider.Preview({});
    }).toThrow('Rickshaw.Graph.RangeSlider.Preview needs a reference to an element');

    const element = createTestElement();
    expect(() => {
      new Rickshaw.Graph.RangeSlider.Preview({ element });
    }).toThrow('Rickshaw.Graph.RangeSlider.Preview needs a reference to an graph or an array of graphs');
  });

  test('initializes with default settings', () => {
    const element = createTestElement();
    const graph = createTestGraph();
    
    const preview = new Rickshaw.Graph.RangeSlider.Preview({
      element,
      graph
    });

    expect(preview.element).toBe(element);
    expect(preview.element.style.position).toBe('relative');
    expect(preview.graphs).toEqual([graph]);
    expect(preview.heightRatio).toBe(0.2);
    expect(preview.config.height).toBe(100); // 500 * 0.2
    expect(preview.config.width).toBe(960);
    expect(preview.previews.length).toBe(1);
  });

  test('accepts custom configuration', () => {
    const element = createTestElement();
    const graph = createTestGraph();
    
    const preview = new Rickshaw.Graph.RangeSlider.Preview({
      element,
      graph,
      height: 150,
      width: 800,
      heightRatio: 0.3,
      frameColor: '#ff0000',
      frameOpacity: 0.5,
      minimumFrameWidth: 100
    });

    expect(preview.config.height).toBe(150);
    expect(preview.config.width).toBe(800);
    expect(preview.heightRatio).toBe(0.3);
    expect(preview.config.frameColor).toBe('#ff0000');
    expect(preview.config.frameOpacity).toBe(0.5);
    expect(preview.config.minimumFrameWidth).toBe(100);
  });

  test('supports multiple graphs', () => {
    const element = createTestElement();
    const graph1 = createTestGraph({ renderer: 'scatterplot', color: 'steelblue' });
    const graph2 = createTestGraph({ renderer: 'line', color: 'red' });

    const preview = new Rickshaw.Graph.RangeSlider.Preview({
      element,
      graphs: [graph1, graph2]
    });

    expect(preview.graphs.length).toBe(2);
    expect(preview.previews.length).toBe(2);
    expect(preview.previews[0].renderer.name).toBe('scatterplot');
    expect(preview.previews[1].renderer.name).toBe('line');
  });

  test('registers and triggers callbacks', () => {
    const element = createTestElement();
    const graph = createTestGraph();
    
    const preview = new Rickshaw.Graph.RangeSlider.Preview({
      element,
      graph
    });

    const slideCallback = jest.fn();
    const configureCallback = jest.fn();

    preview.onSlide(slideCallback);
    preview.onConfigure(configureCallback);

    expect(preview.slideCallbacks).toContain(slideCallback);
    expect(preview.configureCallbacks).toContain(configureCallback);

    // Test configure callback
    preview.configure({ width: 800 });
    expect(configureCallback).toHaveBeenCalledWith({ width: 800 });
  });

  test('creates expected DOM structure', () => {
    const element = createTestElement();
    const graph = createTestGraph();
    
    const preview = new Rickshaw.Graph.RangeSlider.Preview({
      element,
      graph
    });

    // Check SVG creation
    const svg = element.querySelector('svg.rickshaw_range_slider_preview');
    expect(svg).toBeTruthy();
    expect(svg.style.position).toBe('absolute');
    expect(svg.style.top).toBe('0px');
    expect(svg.style.width).toBe('960px');
    expect(svg.style.height).toBe('100px');

    // Check preview container
    const container = element.querySelector('div.rickshaw_range_slider_preview_container');
    expect(container).toBeTruthy();
    expect(container.style.transform).toBe('translate(10px, 3px)');
  });

  test('handles width and height from graph', () => {
    const element = createTestElement();
    const graph = createTestGraph({ width: 1000, height: 600 });
    
    const preview = new Rickshaw.Graph.RangeSlider.Preview({
      element,
      graph,
      width: null,  // Should take from graph
      height: null  // Should calculate from graph using heightRatio
    });

    expect(preview.widthFromGraph).toBe(true);
    expect(preview.heightFromGraph).toBe(true);
    expect(preview.config.width).toBe(1000);
    expect(preview.config.height).toBe(120); // 600 * 0.2
  });
});
