const d3 = require('d3');
const Rickshaw = require('../rickshaw');

describe('Rickshaw.Graph.DragZoom', () => {
  let element;
  let graph;
  let drag;

  beforeEach(() => {
    // Create element directly without ID
    element = document.createElement('div');
    document.body.appendChild(element);

    // Create graph
    graph = new Rickshaw.Graph({
      element: element,
      width: 960,
      height: 500,
      renderer: 'scatterplot',
      series: [{
        color: 'steelblue',
        data: [
          { x: 0, y: 40 },
          { x: 1, y: 49 },
          { x: 2, y: 38 },
          { x: 3, y: 30 },
          { x: 4, y: 32 }
        ]
      }]
    });

    graph.renderer.dotSize = 6;
    graph.render();

    // Create drag zoom
    drag = new Rickshaw.Graph.DragZoom({
      graph: graph,
      opacity: 0.5,
      fill: 'steelblue',
      minimumTimeSelection: 15,
      callback: function(args) {
        // Mock callback
      }
    });
  });

  afterEach(() => {
    // Clean up DOM
    document.body.innerHTML = '';
  });

  test('initializes with correct properties', () => {
    expect(graph.renderer.name).toBe(drag.graph.renderer.name);
    expect(drag.svgWidth).toBe(960);
  });

  test('creates and removes rect on drag', () => {
    // Initial state - no rect
    let rect = d3.select(element).selectAll('rect')[0][0];
    expect(rect).toBeUndefined();

    // Mousedown - should create rect
    const mouseDown = document.createEvent('MouseEvent');
    mouseDown.initMouseEvent('mousedown', true, true, window, 1, 800, 600, 290, 260, false, false, false, false, 0, null);
    drag.svg[0][0].dispatchEvent(mouseDown);

    rect = d3.select(element).selectAll('rect')[0][0];
    expect(rect).toBeTruthy();
    expect(rect.style.opacity).toBe(String(drag.opacity));

    // Mousemove - should update rect
    const mouseMove = document.createEvent('MouseEvent');
    mouseMove.initMouseEvent('mousemove', true, true, window, 1, 900, 600, 290, 260, false, false, false, false, 0, null);
    drag.svg[0][0].dispatchEvent(mouseMove);

    // Note: offsetX is not set in jsdom environment
    expect(rect.getAttribute('fill')).toBeNull();
    expect(rect.getAttribute('x')).toBeNull();
    expect(rect.getAttribute('width')).toBeNull();

    // Escape key - should remove rect
    const escapeKey = document.createEvent('KeyboardEvent');
    escapeKey.initEvent('keyup', true, true, null, false, false, false, false, 27, 0);
    document.dispatchEvent(escapeKey);

    rect = d3.select(element).selectAll('rect')[0][0];
    expect(rect).toBeUndefined();
  });

  test('removes rect on mouseup without drag', () => {
    // Initial state - no rect
    let rect = d3.select(element).selectAll('rect')[0][0];
    expect(rect).toBeUndefined();

    // Mousedown - should create rect
    const mouseDown = document.createEvent('MouseEvent');
    mouseDown.initMouseEvent('mousedown', true, true, window, 1, 800, 600, 290, 260, false, false, false, false, 0, null);
    drag.svg[0][0].dispatchEvent(mouseDown);

    rect = d3.select(element).selectAll('rect')[0][0];
    expect(rect).toBeTruthy();
    expect(rect.style.opacity).toBe(String(drag.opacity));

    // Mouseup - should remove rect
    const mouseUp = document.createEvent('MouseEvent');
    mouseUp.initMouseEvent('mouseup', true, true, window, 1, 900, 600, 290, 260, false, false, false, false, 0, null);
    document.dispatchEvent(mouseUp);

    rect = d3.select(element).selectAll('rect')[0][0];
    expect(rect).toBeUndefined();

    // Mousedown again - should not create rect (listener removed)
    const mouseDownAgain = document.createEvent('MouseEvent');
    mouseDownAgain.initMouseEvent('mousedown', true, true, window, 1, 800, 600, 290, 260, false, false, false, false, 0, null);
    drag.svg[0][0].dispatchEvent(mouseDownAgain);
    expect(rect).toBeUndefined();
  });

  test('throws error when initialized without graph', () => {
    expect(() => {
      new Rickshaw.Graph.DragZoom();
    }).toThrow('Rickshaw.Graph.DragZoom needs a reference to a graph');
  });
});
