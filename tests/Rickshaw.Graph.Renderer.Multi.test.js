const Rickshaw = require('../rickshaw');

describe('Rickshaw.Graph.Renderer.Multi', () => {
  afterEach(() => {
    // Clean up DOM
    document.body.innerHTML = '';
    // Clean up renderer
    delete Rickshaw.Graph.Renderer.DomainSubrenderer;
  });

  test('should determine domain from subrenderers', () => {
    // Create element
    const element = document.createElement('div');
    document.body.appendChild(element);

    // Define test renderer inline
    Rickshaw.namespace('Rickshaw.Graph.Renderer.DomainSubrenderer');
    Rickshaw.Graph.Renderer.DomainSubrenderer = Rickshaw.Class.create(Rickshaw.Graph.Renderer, {
      name: 'domain',
      domain: function() {
        return { x: [-10, 20], y: [-15, 30] };
      }
    });

    // Test direct renderer first
    const singleGraph = new Rickshaw.Graph({
      element: element,
      width: 960,
      height: 500,
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
      renderer: 'domain',
      series: [{
        color: 'steelblue',
        data: [
          { x: 0, y: 40 },
          { x: 1, y: 49 }
        ]
      }]
    });

    expect(singleGraph.renderer.domain()).toEqual({
      x: [-10, 20],
      y: [-15, 30]
    });

    // Test multi renderer
    const multiGraph = new Rickshaw.Graph({
      element: element,
      width: 960,
      height: 500,
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
      renderer: 'multi',
      series: [{
        renderer: 'domain',
        data: [
          { x: 0, y: 40 },
          { x: 1, y: 49 }
        ]
      }]
    });

    expect(multiGraph.renderer.domain()).toEqual({
      x: [-10, 20],
      y: [-15, 30]
    });
  });
});
