const d3 = require('d3');
const fs = require('fs');
const Rickshaw = require('../rickshaw');

describe('Rickshaw.Graph', () => {
  afterEach(() => {
    // Clean up DOM
    document.body.innerHTML = '';
  });

  test('renders SVG matching reference', () => {
    const element = document.createElement('div');
    document.body.appendChild(element);

    const graph = new Rickshaw.Graph({
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
          { x: 3, y: 30 }
        ],
        strokeWidth: 5,
        opacity: 0.8
      }, {
        color: 'blue',
        data: [{ x: 4, y: 32 }]
      }]
    });

    graph.renderer.dotSize = 6;
    graph.render();

    const generatedSVG = element.innerHTML;
    const exampleSVG = fs.readFileSync(__dirname + '/data/simple.svg', 'utf8').trim();

    expect(generatedSVG).toBe(exampleSVG);
  });

  test('validates data point order', () => {
    const element = document.createElement('div');
    document.body.appendChild(element);

    expect(() => {
      new Rickshaw.Graph({
        element: element,
        width: 960,
        height: 500,
        series: [{
          color: 'steelblue',
          data: [
            { x: 0, y: 40 },
            { x: 5, y: 49 },
            { x: 2, y: 38 },
            { x: 3, y: 30 },
            { x: 4, y: 32 }
          ]
        }]
      });
    }).toThrow();
  });

  test('handles empty data when rendering multiple series', () => {
    const element = document.createElement('div');
    document.body.appendChild(element);

    expect(() => {
      new Rickshaw.Graph({
        element: element,
        width: 960,
        height: 500,
        renderer: 'line',
        series: [
          { data: [], name: 'first: empty' },
          {
            data: [
              { x: 0, y: 40 },
              { x: 1, y: 49 },
              { x: 2, y: 38 },
              { x: 3, y: 30 },
              { x: 4, y: 32 }
            ],
            name: '5 datas'
          },
          { data: [], name: 'last: empty' }
        ]
      });
    }).not.toThrow();
  });

  describe('scales', () => {
    test('handles custom d3 scales', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);

      const times = [1380000000000, 1390000000000];
      const series = [{
        color: 'steelblue',
        data: [
          { x: times[0], y: 40 },
          { x: times[1], y: 49 }
        ]
      }];

      const scale = d3.time.scale();
      const graph = new Rickshaw.Graph({
        element: element,
        width: 960,
        height: 500,
        xScale: scale,
        yScale: d3.scale.sqrt(),
        series: series
      });

      graph.render();

      const xAxis = new Rickshaw.Graph.Axis.X({
        graph: graph,
        tickFormat: graph.x.tickFormat()
      });
      xAxis.render();

      const yAxis = new Rickshaw.Graph.Axis.Y({
        graph: graph
      });
      yAxis.render();

      // Check x-axis ticks
      expect(graph.x.ticks()[0]).toBeInstanceOf(Date);
      const xTicks = element.getElementsByClassName('x_ticks_d3')[0].getElementsByTagName('text');
      expect(xTicks[0].innerHTML).toBe('Sep 29');
      expect(xTicks[1].innerHTML).toBe('Oct 06');
      expect(xTicks[8].innerHTML).toBe('Nov 24');

      // Check y-axis ticks
      const yTicks = element.getElementsByClassName('y_ticks')[0].getElementsByTagName('g');
      expect(yTicks[0].getAttribute('transform')).toBe('translate(0,500)');
      expect(yTicks[1].getAttribute('transform')).toBe('translate(0,275.24400874015976)');
      expect(yTicks[2].getAttribute('transform')).toBe('translate(0,182.14702893572516)');

      // Check scale independence
      scale.range([0, 960]);
      expect(scale.range()).toEqual(graph.x.range());
      scale.range([0, 1]);
      expect(scale.range()).not.toEqual(graph.x.range());
    });
  });

  describe('inconsistent series', () => {
    test('allows inconsistent length series for line renderer', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);

      const series = [
        {
          color: 'steelblue',
          data: [
            { x: 0, y: 40 },
            { x: 1, y: 49 },
            { x: 2, y: 38 },
            { x: 3, y: 88 }
          ]
        },
        {
          color: 'red',
          data: [
            { x: 0, y: 40 },
            { x: 1, y: 49 },
            { x: 2, y: 38 }
          ]
        }
      ];

      expect(() => {
        new Rickshaw.Graph({
          element: element,
          width: 960,
          height: 500,
          renderer: 'line',
          series: series
        });
      }).not.toThrow();
    });

    test('throws for inconsistent series with stack renderer', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);

      const series = [
        {
          color: 'steelblue',
          data: [
            { x: 0, y: 40 },
            { x: 1, y: 49 },
            { x: 2, y: 38 },
            { x: 3, y: 88 }
          ]
        },
        {
          color: 'red',
          data: [
            { x: 0, y: 40 },
            { x: 1, y: 49 },
            { x: 2, y: 38 }
          ]
        }
      ];

      expect(() => {
        new Rickshaw.Graph({
          element: element,
          width: 960,
          height: 500,
          renderer: 'stack',
          series: series
        });
      }).toThrow();
    });

    test('throws for undefined element', () => {
      const series = [
        {
          color: 'steelblue',
          data: [{ x: 0, y: 40 }]
        }
      ];

      expect(() => {
        new Rickshaw.Graph({
          element: null,
          width: 960,
          height: 500,
          renderer: 'stack',
          series: series
        });
      }).toThrow();
    });
  });

  describe('configuration', () => {
    test('handles padding configuration', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);

      const graph = new Rickshaw.Graph({
        element: element,
        width: 960,
        height: 500,
        padding: { top: 0.2 },
        renderer: 'stack',
        series: [{ data: [{ x: 1, y: 40 }] }]
      });

      expect(graph.renderer.padding).toEqual({
        bottom: 0.01,
        right: 0,
        left: 0,
        top: 0.2
      });
      expect(graph.padding).toBeUndefined();

      graph.configure({ padding: { top: 0.25, bottom: 0.25, right: 0.25, left: 0.25 } });

      expect(graph.renderer.padding).toEqual({
        bottom: 0.25,
        right: 0.25,
        left: 0.25,
        top: 0.25
      });
      expect(graph.padding).toBeUndefined();
    });

    test('handles configure callback', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);

      const graph = new Rickshaw.Graph({
        element: element,
        width: 960,
        height: 500,
        padding: { top: 0.2 },
        renderer: 'stack',
        series: [{ data: [{ x: 1, y: 40 }] }]
      });

      const callback = jest.fn();
      graph.onConfigure(callback);
      graph.configure({ interpolation: 'step-after' });

      expect(callback).toHaveBeenCalledWith({ interpolation: 'step-after' });
      expect(graph.interpolation).toBe('step-after');
      expect(graph.config.interpolation).toBe('step-after');
    });

    test('handles dimension changes', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);

      const graph = new Rickshaw.Graph({
        element: element,
        width: 960,
        height: 500,
        padding: { top: 0.2 },
        renderer: 'stack',
        series: [{ data: [{ x: 1, y: 40 }] }]
      });

      graph.configure({ width: 900, height: 100 });

      expect(graph.width).toBe(900);
      expect(graph.height).toBe(100);
      expect(graph.vis[0][0].getAttribute('width')).toBe('900');
      expect(graph.vis[0][0].getAttribute('height')).toBe('100');
    });
  });

  describe('setSeries', () => {
    test('updates series data', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);

      const graph = new Rickshaw.Graph({
        element: element,
        width: 960,
        height: 500,
        padding: { top: 0.2 },
        renderer: 'stack',
        series: [{ data: [{ x: 1, y: 40 }] }]
      });

      expect(graph.series[0].data[0].y).toBe(40);

      graph.setSeries([{
        data: []
      }, {
        data: [{ x: 2, y: 3 }]
      }]);

      expect(graph.series[0].data[0]).toBeUndefined();
      expect(graph.series[1].data[0].x).toBe(2);
    });
  });

  describe('renderer autodiscovery', () => {
    test('throws for unknown renderer', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);

      expect(() => {
        new Rickshaw.Graph({
          element: element,
          width: 960,
          height: 500,
          renderer: 'testline',
          series: [{
            color: 'steelblue',
            data: [{ x: 0, y: 40 }]
          }]
        });
      }).toThrow();
    });

    test('discovers new renderer', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);

      // Define new renderer
      Rickshaw.namespace('Rickshaw.Graph.Renderer.TestLine');
      Rickshaw.Graph.Renderer.TestLine = Rickshaw.Class.create(Rickshaw.Graph.Renderer.Line, {
        name: 'testline'
      });

      expect(() => {
        new Rickshaw.Graph({
          element: element,
          width: 960,
          height: 500,
          renderer: 'testline',
          series: [{
            color: 'steelblue',
            data: [{ x: 0, y: 40 }]
          }]
        });
      }).not.toThrow();

      // Clean up
      delete Rickshaw.Graph.Renderer.TestLine;
    });
  });
});
