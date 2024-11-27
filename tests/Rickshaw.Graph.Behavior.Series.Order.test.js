const Rickshaw = require('../rickshaw');
const jQuery = require('jquery');

describe('Rickshaw.Graph.Behavior.Series.Order', () => {
  // Store original jQuery and jQuery UI
  let originalJQuery;
  let originalJQueryUI;
  let originalSortable;

  // Helper function to create a test graph
  function createTestGraph() {
    const element = document.createElement('div');
    document.body.appendChild(element);

    const graph = new Rickshaw.Graph({
      element,
      width: 960,
      height: 500,
      renderer: 'line',
      series: [
        {
          name: 'series1',
          data: [{ x: 0, y: 23 }, { x: 1, y: 15 }],
          color: '#ff0000'
        },
        {
          name: 'series2',
          data: [{ x: 0, y: 12 }, { x: 1, y: 21 }],
          color: '#00ff00'
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

  beforeAll(() => {
    // Store original jQuery and jQuery UI
    originalJQuery = window.jQuery;
    originalJQueryUI = window.jQuery ? window.jQuery.ui : undefined;
    originalSortable = jQuery.fn.sortable;

    // Set jQuery on window
    window.jQuery = jQuery;
    window.jQuery.ui = {};

    // Mock sortable functionality
    jQuery.fn.sortable = function(options) {
      jQuery(this).each(function() {
        const $el = jQuery(this);
        $el.data('ui-sortable', options);
        $el[0]._sortableOptions = options;
      });
      return this;
    };

    jQuery.fn.disableSelection = function() {
      return this;
    };
  });

  afterAll(() => {
    // Restore original jQuery and jQuery UI
    window.jQuery = originalJQuery;
    if (originalJQuery && originalJQueryUI) {
      window.jQuery.ui = originalJQueryUI;
    } else if (window.jQuery) {
      delete window.jQuery.ui;
    }

    // Restore original sortable
    jQuery.fn.sortable = originalSortable;
  });

  afterEach(() => {
    // Clean up DOM
    document.body.innerHTML = '';
  });

  test('initializes with jQuery UI dependency', () => {
    const graph = createTestGraph();
    const legend = createLegend(graph);
    
    // Remove jQuery UI to test error
    delete window.jQuery.ui;
    
    expect(() => {
      new Rickshaw.Graph.Behavior.Series.Order({
        graph,
        legend
      });
    }).toThrow("couldn't find jQuery UI at window.jQuery.ui");

    // Restore jQuery UI
    window.jQuery.ui = {};
  });

  test('initializes with jQuery dependency', () => {
    const graph = createTestGraph();
    const legend = createLegend(graph);
    
    // Store jQuery temporarily
    const tempJQuery = window.jQuery;
    delete window.jQuery;
    
    expect(() => {
      new Rickshaw.Graph.Behavior.Series.Order({
        graph,
        legend
      });
    }).toThrow("couldn't find jQuery at window.jQuery");

    // Restore jQuery
    window.jQuery = tempJQuery;
  });

  test('makes legend sortable with correct options', done => {
    const graph = createTestGraph();
    const legend = createLegend(graph);
    
    new Rickshaw.Graph.Behavior.Series.Order({
      graph,
      legend
    });

    // Wait for jQuery ready callback
    jQuery(() => {
      // Get the sortable options
      const options = jQuery(legend.list).data('ui-sortable');

      // Verify sortable was initialized with correct options
      expect(options).toEqual({
        containment: 'parent',
        tolerance: 'pointer',
        update: expect.any(Function)
      });

      done();
    });
  });

  test('updates graph when legend items are reordered', done => {
    const graph = createTestGraph();
    const legend = createLegend(graph);
    
    new Rickshaw.Graph.Behavior.Series.Order({
      graph,
      legend
    });

    // Wait for jQuery ready callback
    jQuery(() => {
      // Mock graph update
      const graphUpdateSpy = jest.spyOn(graph, 'update');

      // Get the update callback and call it
      const options = jQuery(legend.list).data('ui-sortable');
      options.update();

      // Verify graph update was called
      expect(graphUpdateSpy).toHaveBeenCalled();
      graphUpdateSpy.mockRestore();

      done();
    });
  });

  test('maintains legend height during updates', () => {
    const graph = createTestGraph();
    const legend = createLegend(graph);
    
    new Rickshaw.Graph.Behavior.Series.Order({
      graph,
      legend
    });

    // Mock getComputedStyle
    const originalGetComputedStyle = window.getComputedStyle;
    window.getComputedStyle = jest.fn(() => ({ height: '100px' }));

    // Trigger a graph update
    graph.update();

    // Verify the legend height was maintained
    expect(legend.element.style.height).toBe('100px');

    // Restore getComputedStyle
    window.getComputedStyle = originalGetComputedStyle;
  });
});
