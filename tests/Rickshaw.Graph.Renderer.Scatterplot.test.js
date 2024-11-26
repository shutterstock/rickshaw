const Rickshaw = require('../rickshaw');

describe('Rickshaw.Graph.Renderer.Scatterplot', () => {
  test('should add the series className to all scatterplot points', () => {
    const element = document.createElement('div');
    
    // Create a graph with test data
    const graph = new Rickshaw.Graph({
      element,
      stroke: true,
      width: 10,
      height: 10,
      renderer: 'scatterplot',
      series: [
        {
          className: 'fnord',
          data: [
            { x: 0, y: 40 },
            { x: 1, y: 49 },
            { x: 2, y: 38 },
            { x: 3, y: 30 }
          ],
          opacity: 0.8
        },
        {
          className: 'fnord',
          data: [{ x: 4, y: 32 }]
        }
      ]
    });

    // Render the graph
    graph.render();

    // Query for all circles with the className
    const circles = graph.vis.selectAll('circle.fnord');
    expect(circles.size()).toBe(5);
    element.remove();
  });

  test('should set series opacity correctly', () => {
    const element = document.createElement('div');
    
    // Create a graph with varying opacity values
    const graph = new Rickshaw.Graph({
      element,
      stroke: true,
      width: 10,
      height: 10,
      renderer: 'scatterplot',
      series: [
        {
          className: 'fnord',
          data: [
            { x: 0, y: 40 },
            { x: 1, y: 49 },
            { x: 2, y: 38 },
            { x: 3, y: 30 }
          ],
          opacity: 0.8
        },
        {
          className: 'fnord',
          data: [{ x: 4, y: 32 }]
        },
        {
          className: 'fnord',
          opacity: 0,
          data: [{ x: 5, y: 32 }]
        }
      ]
    });

    // Render the graph
    graph.render();

    // Query all circles - in D3 v3, the selection itself is an array-like object
    const circles = graph.vis.selectAll('circle.fnord');

    // Test different opacity values using D3 v3's array-like selection format
    expect(circles[0][1].getAttribute('opacity')).toBe('0.8'); // Custom opacity
    expect(circles[0][4].getAttribute('opacity')).toBe('1');   // Default opacity
    expect(circles[0][5].getAttribute('opacity')).toBe('0');   // Zero opacity
    element.remove();
  });
});
