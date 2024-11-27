const Rickshaw = require('../rickshaw');

describe('Rickshaw.Graph.HoverDetail', () => {
  // Helper function to create a test graph
  function createTestGraph(element, series = [{
    name: 'testseries',
    data: [{ x: 4, y: 32 }, { x: 16, y: 100 }]
  }]) {
    const graph = new Rickshaw.Graph({
      width: 900,
      height: 500,
      element,
      series,
      renderer: 'line' // Add renderer to initialize stackedData
    });
    graph.render(); // Pre-render graph
    
    // Mock getBoundingClientRect for the SVG element
    const svg = d3.select(element).select('svg').node();
    svg.getBoundingClientRect = () => ({
      left: 0,
      top: 0,
      width: 900,
      height: 500
    });

    return graph;
  }

  // Helper function to create mouse events
  function createMouseEvent(type, target) {
    const event = document.createEvent('Event');
    event.initEvent(type, true, true);
    event.relatedTarget = {
      compareDocumentPosition: jest.fn()
    };
    if (target) {
      event.target = target;
    }
    return event;
  }

  test('initializes with default settings', () => {
    const element = document.createElement('div');
    const graph = createTestGraph(element);
    
    const hoverDetail = new Rickshaw.Graph.HoverDetail({
      graph
    });

    expect(hoverDetail.visible).toBe(true);
    expect(typeof hoverDetail.formatter).toBe('function');
    expect(typeof hoverDetail.xFormatter).toBe('function');
    expect(typeof hoverDetail.yFormatter).toBe('function');

    const detail = d3.select(element).selectAll('.detail');
    expect(hoverDetail.element).toBe(detail[0][0]);
    expect(detail[0].length).toBe(1);

    // Clean up
    element.remove();
  });

  test('accepts custom formatters', () => {
    const element = document.createElement('div');
    const graph = createTestGraph(element);
    
    const formatter = jest.fn();
    const xFormatter = jest.fn();
    const yFormatter = jest.fn();

    const hoverDetail = new Rickshaw.Graph.HoverDetail({
      graph,
      formatter,
      xFormatter,
      yFormatter
    });

    expect(formatter).not.toHaveBeenCalled();
    expect(xFormatter).not.toHaveBeenCalled();
    expect(yFormatter).not.toHaveBeenCalled();

    hoverDetail.formatter();
    expect(formatter).toHaveBeenCalledTimes(1);

    hoverDetail.xFormatter();
    expect(xFormatter).toHaveBeenCalledTimes(1);

    hoverDetail.yFormatter();
    expect(yFormatter).toHaveBeenCalledTimes(1);

    // Clean up
    element.remove();
  });

  test('updates correctly on mouse events', () => {
    const element = document.createElement('div');
    const graph = createTestGraph(element);
    
    const hoverDetail = new Rickshaw.Graph.HoverDetail({
      graph
    });
    hoverDetail.render = jest.fn();

    // Test update without event
    hoverDetail.update();
    expect(hoverDetail.render).not.toHaveBeenCalled();

    // Test direct render with points
    hoverDetail.render({
      points: [{
        active: true,
        series: graph.series[0],
        value: graph.series[0].data[0],
        formattedXValue: '4 foo',
        formattedYValue: '32 bar'
      }]
    });
    expect(hoverDetail.render).toHaveBeenCalledWith(expect.objectContaining({
      points: expect.arrayContaining([
        expect.objectContaining({
          active: true,
          value: expect.objectContaining({ x: 4, y: 32 })
        })
      ])
    }));

    // Test render with null value
    hoverDetail.render({
      points: [{
        active: true,
        series: graph.series[0],
        value: { y: null }
      }]
    });
    const items = d3.select(element).selectAll('.item');
    expect(items[0].length).toBe(0);

    // Clean up
    element.remove();
  });

  test('handles event listeners correctly', () => {
    const element = document.createElement('div');
    const graph = createTestGraph(element);
    
    const onHide = jest.fn();
    const hoverDetail = new Rickshaw.Graph.HoverDetail({
      graph,
      onHide
    });

    expect(typeof hoverDetail.mousemoveListener).toBe('function');
    expect(typeof hoverDetail.mouseoutListener).toBe('function');

    // Test mouseout event
    const mouseoutEvent = createMouseEvent('mouseout');
    element.dispatchEvent(mouseoutEvent);
    expect(onHide).toHaveBeenCalledTimes(1);
    expect(hoverDetail.visible).toBe(false);

    // Test SPA-like DOM manipulation
    expect(hoverDetail.element.parentNode).toBe(element);
    expect(element.childNodes.length).toBe(2);
    graph.element.removeChild(element.childNodes[0]);
    graph.element.removeChild(element.childNodes[0]);
    expect(element.innerHTML).toBe('');
    expect(hoverDetail.element.parentNode).toBe(null);

    // Test mousemove after DOM manipulation
    hoverDetail.update = jest.fn();
    const moveEvent = createMouseEvent('mousemove');
    element.dispatchEvent(moveEvent);
    expect(hoverDetail.visible).toBe(true);
    expect(hoverDetail.update).toHaveBeenCalledTimes(1);

    // Test listener removal
    hoverDetail.update = jest.fn();
    hoverDetail._removeListeners();
    element.dispatchEvent(moveEvent);
    expect(hoverDetail.update).not.toHaveBeenCalled();

    // Clean up
    element.remove();
  });

  test('renders hover details correctly', () => {
    const element = document.createElement('div');
    const graph = createTestGraph(element);
    
    const onShow = jest.fn();
    const onHide = jest.fn();
    const onRender = jest.fn();
    
    const hoverDetail = new Rickshaw.Graph.HoverDetail({
      graph,
      onShow,
      onHide,
      onRender
    });

    // Test render with null value
    hoverDetail.render({
      points: [{
        active: true,
        series: graph.series[0],
        value: { y: null }
      }]
    });

    let items = d3.select(element).selectAll('.item');
    expect(items[0].length).toBe(0);
    expect(onRender).not.toHaveBeenCalled();

    // Test render with multiple points
    hoverDetail.render({
      points: [{
        active: true,
        series: graph.series[0],
        value: graph.series[0].data[0],
        formattedXValue: '4 foo',
        formattedYValue: '32 bar'
      }, {
        active: true,
        series: graph.series[0],
        value: graph.series[0].data[1]
      }, {
        active: true,
        series: graph.series[0],
        value: { y: null }
      }]
    });

    expect(onShow).toHaveBeenCalledTimes(1);
    expect(onRender).toHaveBeenCalledTimes(1);

    const xLabel = d3.select(element).selectAll('.x_label');
    expect(xLabel[0].length).toBe(1);
    expect(xLabel[0][0].innerHTML).toBe('4 foo');

    items = d3.select(element).selectAll('.item');
    expect(items[0].length).toBe(1);
    expect(items[0][0].innerHTML).toBe('testseries:&nbsp;32 bar');

    const dots = d3.select(element).selectAll('.dot');
    expect(dots[0].length).toBe(1);

    // Test hide functionality
    hoverDetail.hide();
    expect(onHide).toHaveBeenCalledTimes(1);

    // Clean up
    element.remove();
  });

  test('handles DOM cleanup correctly', () => {
    const element = document.createElement('div');
    const graph = createTestGraph(element);
    
    const hoverDetail = new Rickshaw.Graph.HoverDetail({
      graph
    });

    // Test initial DOM state
    expect(hoverDetail.element.parentNode).toBe(element);
    expect(element.childNodes.length).toBe(2);

    // Test SPA-like DOM cleanup
    graph.element.removeChild(element.childNodes[0]);
    graph.element.removeChild(element.childNodes[0]);
    expect(element.innerHTML).toBe('');
    expect(hoverDetail.element.parentNode).toBe(null);

    // Test event handling after cleanup
    hoverDetail.update = jest.fn();
    const moveEvent = createMouseEvent('mousemove');
    element.dispatchEvent(moveEvent);
    expect(hoverDetail.visible).toBe(true);
    expect(hoverDetail.update).toHaveBeenCalledTimes(1);

    // Test listener removal
    hoverDetail.update = jest.fn();
    hoverDetail._removeListeners();
    element.dispatchEvent(moveEvent);
    expect(hoverDetail.update).not.toHaveBeenCalled();

    // Clean up
    element.remove();
  });
});
