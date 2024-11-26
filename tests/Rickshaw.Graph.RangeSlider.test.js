const d3 = require('d3');
const { JSDOM } = require('jsdom');
const jQuery = require('jquery');
const Rickshaw = require('../rickshaw');

// Helper function to create test graphs
function createGraphs() {
  const graphs = [];
  // Set up data series with 50 random data points
  const seriesData = [[], [], []];
  const random = new Rickshaw.Fixtures.RandomData(150);

  for (let i = 0; i < 150; i++) {
    random.addData(seriesData);
  }

  const colors = ['#c05020', '#30c020', '#6060c0'];
  const names = ['New York', 'London', 'Tokyo'];

  // Make all three graphs in a loop
  for (let i = 0; i < names.length; i++) {
    const graph = new Rickshaw.Graph({
      element: document.getElementById(`chart_${i}`),
      width: 800 * i,
      height: 100,
      renderer: 'line',
      series: [{
        color: colors[i],
        data: seriesData[i],
        name: names[i]
      }]
    });

    graph.render();
    graphs.push(graph);
  }

  return graphs;
}

describe('Rickshaw.Graph.RangeSlider', () => {
  let document;
  let window;

  beforeEach(() => {
    // Set up DOM environment
    const dom = new JSDOM(`
      <html>
        <head></head>
        <body>
          <div id="chart_0"></div>
          <div id="chart_1"></div>
          <div id="chart_2">
            <div id="slider"></div>
          </div>
        </body>
      </html>
    `);

    // Set up global environment
    document = dom.window.document;
    window = dom.window;
    global.document = document;
    global.window = window;
    global.jQuery = jQuery;

    // Initialize Rickshaw compatibility
    new Rickshaw.Compat.ClassList();
  });

  afterEach(() => {
    // Clean up
    delete require.cache.d3;
  });

  test('creates slider with single graph', () => {
    const graphs = createGraphs();
    const slider = new Rickshaw.Graph.RangeSlider({
      element: document.getElementById('slider'),
      graph: createGraphs()[0]
    });

    expect(slider.graph).toBeTruthy();
  });

  test('creates slider with jQuery element', () => {
    const graphs = createGraphs();
    const slider = new Rickshaw.Graph.RangeSlider({
      element: jQuery('#slider'),
      graph: createGraphs()[0]
    });

    expect(slider.graph).toBeTruthy();
    expect(jQuery(slider.element)[0].style.width).toBe('');
    
    slider.graph.configure({});
    expect(slider.element[0].style.width).toBe('400px');
  });

  test('supports multiple graphs with shared slider', () => {
    const slider = new Rickshaw.Graph.RangeSlider({
      element: document.getElementById('slider'),
      graphs: createGraphs()
    });

    // Test multiple graphs support
    expect(slider.graphs).toBeTruthy();
    expect(slider.graph).toBe(slider.graphs[0]);

    // Test width adjustments
    expect(slider.element.style.width).toBe('');
    
    slider.graphs[0].configure({});
    expect(slider.element.style.width).toBe('400px');
    
    slider.graphs[2].configure({});
    expect(slider.element.style.width).toBe('1600px');
  });
});
