const d3 = require('d3');
const Rickshaw = require('../rickshaw');

describe('Rickshaw.Graph.Annotate', () => {
  // Helper function to create a test graph and annotate instance
  function createTestGraph() {
    const element = document.createElement('div');
    return new Rickshaw.Graph({
      width: 900,
      element: element,
      series: [{
        data: [
          { x: 4, y: 32 },
          { x: 16, y: 100 }
        ]
      }]
    });
  }

  test('initializes with correct elements', () => {
    const graph = createTestGraph();
    const annotateElement = document.createElement('div');

    const annotate = new Rickshaw.Graph.Annotate({
      graph: graph,
      element: annotateElement
    });

    expect(annotate.elements.timeline).toBe(annotateElement);
    const timeline = d3.select(graph.element).selectAll('.rickshaw_annotation_timeline');
    expect(annotate.element).toBe(timeline[0][0]);
  });

  test('adds annotations correctly', () => {
    const graph = createTestGraph();
    const annotateElement = document.createElement('div');

    const annotate = new Rickshaw.Graph.Annotate({
      graph: graph,
      element: annotateElement
    });

    // Add an annotation with time and end time
    const time = 4;
    const endTime = time + 10;
    annotate.add(time, 'annotation', endTime);
    
    // Check if annotation was added with correct structure
    expect(annotate.data[time]).toEqual({
      boxes: [{
        content: 'annotation',
        end: endTime
      }]
    });

    // Add another annotation to the same time
    annotate.add(time, 'another annotation', endTime + 5);
    
    // Check both annotations at the same time point
    expect(annotate.data[time].boxes.length).toBe(2);
    expect(annotate.data[time].boxes[1]).toEqual({
      content: 'another annotation',
      end: endTime + 5
    });
  });

  test('updates annotations correctly', () => {
    // Create and append test elements to document
    const element = document.createElement('div');
    const annotateElement = document.createElement('div');
    document.body.appendChild(element);
    document.body.appendChild(annotateElement);

    const graph = new Rickshaw.Graph({
      element: element,
      width: 900,
      height: 100,
      series: [{
        data: [{ x: 2900, y: 10 }, { x: 3100, y: 20 }]
      }]
    });

    const annotate = new Rickshaw.Graph.Annotate({
      graph: graph,
      element: annotateElement
    });

    // Add an annotation
    const time = 3000;
    annotate.add(time, 'foo', time + 10 * 1000);
    graph.render();
    annotate.update();

    // Find and click the annotation element
    const annotations = d3.select(annotateElement).selectAll('.annotation');
    expect(annotations[0].length).toBeGreaterThan(0, 'No annotation elements found');
    
    const addedElement = annotations[0][0];
    const clickEvent = document.createEvent('Event');
    clickEvent.initEvent('click', true, true);
    addedElement.dispatchEvent(clickEvent);

    // Check if annotation becomes active after click
    expect(Array.from(addedElement.classList)).toContain('active');

    // Update graph and check if annotation stays visible
    annotate.graph.onUpdate();
    annotate.update();

    expect(addedElement.style.display).toBe('block');
    expect(Array.from(annotate.data[time].element.classList)).toContain('active');

    // Clean up
    document.body.removeChild(element);
    document.body.removeChild(annotateElement);
  });
});
