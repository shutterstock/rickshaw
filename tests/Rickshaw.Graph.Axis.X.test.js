const d3 = require('d3');
const Rickshaw = require('../rickshaw');

describe('Rickshaw.Graph.Axis.X', () => {
  test('renders x-axis with correct ticks', () => {
    // Create test elements
    const element = document.createElement('div');

    // Initialize graph with test data
    const graph = new Rickshaw.Graph({
      width: 900,
      element: element,
      series: [{ data: [{ x: 4, y: 32 }, { x: 16, y: 100 }] }]
    });

    // Create and render x-axis
    const xAxis = new Rickshaw.Graph.Axis.X({
      graph: graph
    });
    xAxis.render();

    // Check ticks
    const ticks = d3.select(element).selectAll('.x_grid_d3 .tick');
    expect(ticks[0].length).toBe(13);
    expect(ticks[0][0].getAttribute('data-x-value')).toBe('4');
  });
});
