const Rickshaw = require('../rickshaw');

describe('Rickshaw.Graph.Legend', () => {
  // Helper function to create a test graph
  function createTestGraph() {
    const element = document.createElement('div');
    return new Rickshaw.Graph({
      element,
      width: 960,
      height: 500,
      renderer: 'stack',
      series: [
        {
          name: 'foo',
          color: 'green',
          stroke: 'red',
          data: [{ x: 4, y: 32 }]
        },
        {
          name: 'bar',
          data: [{ x: 4, y: 32 }]
        }
      ]
    });
  }

  test('renders legend with correct items', () => {
    const graph = createTestGraph();
    const legendElement = document.createElement('div');
    
    const legend = new Rickshaw.Graph.Legend({
      graph,
      element: legendElement
    });

    const items = legendElement.getElementsByTagName('li');
    expect(items.length).toBe(2);
    expect(items[1].getElementsByClassName('label')[0].innerHTML).toBe('foo');
    expect(items[0].getElementsByClassName('label')[0].innerHTML).toBe('bar');

    // Clean up
    graph.element.remove();
    legendElement.remove();
  });

  test('has default class name', () => {
    const graph = createTestGraph();
    const legendElement = document.createElement('div');
    
    const legend = new Rickshaw.Graph.Legend({
      graph,
      element: legendElement
    });

    expect(legendElement.className).toBe('rickshaw_legend');

    // Clean up
    graph.element.remove();
    legendElement.remove();
  });

  test('can override class name through inheritance', () => {
    const graph = createTestGraph();
    const legendElement = document.createElement('div');
    
    const MyLegend = Rickshaw.Class.create(Rickshaw.Graph.Legend, {
      className: 'fnord'
    });

    const legend = new MyLegend({
      graph,
      element: legendElement
    });

    expect(legendElement.className).toBe('fnord');

    // Clean up
    graph.element.remove();
    legendElement.remove();
  });

  test('uses default color key', () => {
    const graph = createTestGraph();
    const legendElement = document.createElement('div');
    
    const legend = new Rickshaw.Graph.Legend({
      graph,
      element: legendElement
    });

    expect(legend.colorKey).toBe('color');
    expect(legendElement.getElementsByClassName('swatch')[1].style.backgroundColor).toBe('green');

    // Clean up
    graph.element.remove();
    legendElement.remove();
  });

  test('can override color key', () => {
    const graph = createTestGraph();
    const legendElement = document.createElement('div');
    
    const legend = new Rickshaw.Graph.Legend({
      graph,
      element: legendElement,
      colorKey: 'stroke'
    });

    expect(legend.colorKey).toBe('stroke');
    expect(legendElement.getElementsByClassName('swatch')[1].style.backgroundColor).toBe('red');

    // Clean up
    graph.element.remove();
    legendElement.remove();
  });

  test('adds series classes to legend elements', () => {
    const graph = createTestGraph();
    const legendElement = document.createElement('div');
    
    // Add class names to series
    graph.series[0].className = 'fnord-series-0';
    graph.series[1].className = 'fnord-series-1';

    const legend = new Rickshaw.Graph.Legend({
      graph,
      element: legendElement
    });

    const items = legendElement.getElementsByTagName('li');
    expect(items[0].className).toContain('fnord-series-1');
    expect(items[1].className).toContain('fnord-series-0');

    // Clean up
    graph.element.remove();
    legendElement.remove();
  });
});
