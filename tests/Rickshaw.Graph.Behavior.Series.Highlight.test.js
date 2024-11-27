const Rickshaw = require('../rickshaw');

describe('Rickshaw.Graph.Behavior.Series.Highlight', () => {
  // Helper function to create a test graph
  function createTestGraph(renderer = 'line') {
    const element = document.createElement('div');
    document.body.appendChild(element);

    const graph = new Rickshaw.Graph({
      element,
      width: 960,
      height: 500,
      renderer,
      series: [
        {
          name: 'series1',
          color: '#ff0000',
          stroke: '#000000',
          data: [{ x: 0, y: 23 }, { x: 1, y: 15 }]
        },
        {
          name: 'series2',
          color: '#00ff00',
          stroke: '#0000ff',
          data: [{ x: 0, y: 12 }, { x: 1, y: 21 }]
        }
      ]
    });
    graph.render();
    return graph;
  }

  // Helper function to create a legend
  function createLegend(graph) {
    const legendElement = document.createElement('div');
    document.body.appendChild(legendElement);
    
    return new Rickshaw.Graph.Legend({
      graph,
      element: legendElement
    });
  }

  // Helper function to create mouse events
  function createMouseEvent(type) {
    const event = document.createEvent('Event');
    event.initEvent(type, true, true);
    return event;
  }

  afterEach(() => {
    // Clean up DOM
    document.body.innerHTML = '';
  });

  test('initializes with default settings', () => {
    const graph = createTestGraph();
    const legend = createLegend(graph);
    
    const highlight = new Rickshaw.Graph.Behavior.Series.Highlight({
      graph,
      legend
    });

    expect(highlight.graph).toBe(graph);
    expect(highlight.legend).toBe(legend);
    expect(typeof highlight.addHighlightEvents).toBe('function');
  });

  test('highlights series on mouseover', () => {
    const graph = createTestGraph();
    const legend = createLegend(graph);
    
    const highlight = new Rickshaw.Graph.Behavior.Series.Highlight({
      graph,
      legend
    });

    // Store original colors
    const originalColors = {
      series1: graph.series[0].color,
      series2: graph.series[1].color
    };

    // Trigger mouseover on first legend item (corresponds to series2)
    const mouseoverEvent = createMouseEvent('mouseover');
    legend.lines[0].element.dispatchEvent(mouseoverEvent);

    // Non-highlighted series should be dimmed
    expect(graph.series[0].color).not.toBe(originalColors.series1);
    expect(graph.series[0].color.toLowerCase()).toMatch(/^#[0-9a-f]{6}$/);

    // Trigger mouseout
    const mouseoutEvent = createMouseEvent('mouseout');
    legend.lines[0].element.dispatchEvent(mouseoutEvent);

    // Colors should be restored
    expect(graph.series[0].color).toBe(originalColors.series1);
    expect(graph.series[1].color).toBe(originalColors.series2);
  });

  test('reorders series for unstacked renderer', () => {
    const graph = createTestGraph('scatterplot'); // Unstack is true for scatterplot
    graph.renderer.unstack = true; // Explicitly set unstack
    const legend = createLegend(graph);
    
    const highlight = new Rickshaw.Graph.Behavior.Series.Highlight({
      graph,
      legend
    });

    // Store original series order
    const originalOrder = graph.series.map(s => s.name);
    
    // Trigger mouseover on first legend item (corresponds to series2)
    const mouseoverEvent = createMouseEvent('mouseover');
    legend.lines[0].element.dispatchEvent(mouseoverEvent);

    // Series should be reordered with highlighted series last
    expect(graph.series[graph.series.length - 1].name).toBe('series2');

    // Trigger mouseout
    const mouseoutEvent = createMouseEvent('mouseout');
    legend.lines[0].element.dispatchEvent(mouseoutEvent);

    // Series order should be restored
    expect(graph.series.map(s => s.name)).toEqual(originalOrder);
  });

  test('supports custom transform function', () => {
    const graph = createTestGraph();
    const legend = createLegend(graph);
    
    const customTransform = jest.fn((isActive, series) => ({
      color: isActive ? series.color : '#999999'
    }));

    const highlight = new Rickshaw.Graph.Behavior.Series.Highlight({
      graph,
      legend,
      transform: customTransform
    });

    // Trigger mouseover on first legend item (corresponds to series2)
    const mouseoverEvent = createMouseEvent('mouseover');
    legend.lines[0].element.dispatchEvent(mouseoverEvent);

    // Custom transform should be called for each series
    expect(customTransform).toHaveBeenCalledTimes(2);
    
    // Verify transform was called with correct arguments
    const calls = customTransform.mock.calls;
    const activeCall = calls.find(call => call[0] === true);
    const inactiveCall = calls.find(call => call[0] === false);
    expect(activeCall[1].name).toBe('series2');
    expect(inactiveCall[1].name).toBe('series1');

    // Colors should be updated according to transform
    expect(graph.series[1].color).toBe('#00ff00'); // Active series keeps color
    expect(graph.series[0].color).toBe('#999999'); // Inactive series gets transformed
  });

  test('preserves original properties when highlighting multiple series', () => {
    const graph = createTestGraph();
    const legend = createLegend(graph);
    
    const highlight = new Rickshaw.Graph.Behavior.Series.Highlight({
      graph,
      legend
    });

    // Store original properties
    const originalProps = graph.series.map(s => ({
      name: s.name,
      color: s.color,
      strokeColor: s.stroke.getAttribute('stroke')
    }));

    // Highlight first legend item (corresponds to series2)
    const mouseoverEvent = createMouseEvent('mouseover');
    legend.lines[0].element.dispatchEvent(mouseoverEvent);

    // Try to highlight second legend item (should be ignored while first is active)
    legend.lines[1].element.dispatchEvent(mouseoverEvent);

    // Only the non-highlighted series should be dimmed
    expect(graph.series[0].color).not.toBe(originalProps[0].color);
    expect(graph.series[0].color.toLowerCase()).toMatch(/^#[0-9a-f]{6}$/);

    // Unhighlight first legend item
    const mouseoutEvent = createMouseEvent('mouseout');
    legend.lines[0].element.dispatchEvent(mouseoutEvent);

    // All properties should be restored
    graph.series.forEach((series, i) => {
      expect(series.color).toBe(originalProps[i].color);
      expect(series.stroke.getAttribute('stroke')).toBe(originalProps[i].strokeColor);
    });
  });
});
