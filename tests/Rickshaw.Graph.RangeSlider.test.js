const d3 = require('d3');
const jQuery = require('jquery');
const Rickshaw = require('../rickshaw');

// Helper function to create test graphs
function createGraphs() {
  const graphs = [];
  const seriesData = [[], [], []];
  const random = new Rickshaw.Fixtures.RandomData(150);

  for (let i = 0; i < 150; i++) {
    random.addData(seriesData);
  }

  const colors = ['#c05020', '#30c020', '#6060c0'];
  const names = ['New York', 'London', 'Tokyo'];

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
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="chart_0"></div>
      <div id="chart_1"></div>
      <div id="chart_2">
        <div id="slider"></div>
      </div>
    `;

    // Setup jQuery globally since RangeSlider expects it
    global.jQuery = jQuery;
    jQuery.fn.jquery = '1.8.1';
  });

  afterEach(() => {
    delete global.jQuery;
  });

  test('creates slider with single graph', () => {
    const graphs = createGraphs();
    const slider = new Rickshaw.Graph.RangeSlider({
      element: document.getElementById('slider'),
      graph: graphs[0]
    });

    expect(slider.graph).toBeTruthy();
  });

  test('creates slider with jQuery element', () => {
    const graphs = createGraphs();
    const slider = new Rickshaw.Graph.RangeSlider({
      element: jQuery('#slider'),
      graph: graphs[0]
    });

    expect(slider.graph).toBeTruthy();
    expect(jQuery(slider.element)[0].style.width).toBe('');
    
    slider.graph.configure({});
    expect(slider.element[0].style.width).toBe('400px');
  });

  test('supports multiple graphs with shared slider', () => {
    const graphs = createGraphs();
    const slider = new Rickshaw.Graph.RangeSlider({
      element: document.getElementById('slider'),
      graphs: graphs
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
