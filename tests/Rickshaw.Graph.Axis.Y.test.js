const d3 = require('d3');
const Rickshaw = require('../rickshaw');

describe('Rickshaw.Graph.Axis.Y', () => {
  test('should render y-axis with correct ticks and handle dimension changes', () => {
    // Set up test DOM elements
    document.body.innerHTML = `
      <div id="y_axis" style="width: 40px;"></div>
      <div id="chart"></div>
    `;

    // Initialize graph with test data
    const chartElement = document.getElementById('chart');
    const yAxisElement = document.getElementById('y_axis');

    const graph = new Rickshaw.Graph({
      width: 900,
      height: 600,
      element: chartElement,
      series: [{ data: [{ x: 4, y: 32 }, { x: 16, y: 100 }] }]
    });

    const yAxis = new Rickshaw.Graph.Axis.Y({
      element: yAxisElement,
      graph: graph,
      orientation: 'left'
    });

    yAxis.render();

    // Test tick rendering
    const ticks = d3.select(chartElement).selectAll('.y_grid .tick');
    expect(ticks[0].length).toBe(11);
    expect(ticks[0][0].getAttribute('data-y-value')).toBe('0');

    // Test initial dimensions
    expect(yAxis.width).toBe(40);
    expect(yAxis.height).toBe(600);

    // Test dimension updates
    yAxis.setSize({ width: 20 });
    expect(yAxis.width).toBe(20);
    expect(yAxis.height).toBe(600);
  });
});
