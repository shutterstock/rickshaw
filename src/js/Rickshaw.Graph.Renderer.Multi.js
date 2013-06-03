Rickshaw.namespace('Rickshaw.Graph.Renderer.Multi');

Rickshaw.Graph.Renderer.Multi = Rickshaw.Class.create( Rickshaw.Graph.Renderer, {

	name: 'multi',

	defaults: function($super) {

		return Rickshaw.extend( $super(), {
			unstack: true,
			fill: false,
			stroke: true
		} );
	},

  render: function(){
    var graph = this.graph;
    var status = this.getStatus();
    var defaultRenderer = graph.defaultRenderer || 'line';
    var seriesGroup = {};
    var rendererOrder = ['stack', 'area', 'line', 'scatterplot', 'bar'];

    //seriesGroup[defaultRenderer] =
    //  {series: [], element: null};

    graph.series.forEach(function(series){
      if (series.disabled) return;
      var rendererName = defaultRenderer;
      if(series.hasOwnProperty('renderer')){
        rendererName = series.renderer;
      }
      if(!seriesGroup.hasOwnProperty(rendererName)){
        seriesGroup[rendererName] =
          {series: [], element: null};
      }
      seriesGroup[rendererName].series.push(series);
      var index = rendererOrder.indexOf(rendererName);
      if (index >= 0) {
        rendererOrder.splice(index, 1);
        rendererOrder.push(rendererName);
      }
    });

    graph.order.forEach(function(order){
      var index = rendererOrder.indexOf(order);
      if (index >= 0) {
        rendererOrder.splice(index, 1);
        rendererOrder.push(order);
      }
    });

    graph.vis.selectAll('*').remove();
    rendererOrder.forEach(function(rendererName){
      if(!seriesGroup.hasOwnProperty(rendererName))
        return;

      var series = seriesGroup[rendererName];
      var renderer = graph._renderers[rendererName];
      var element = status['vis'].append('svg:g').attr('class', rendererName);
      series.element = element;
      
      graph.renderer = renderer;
      graph.vis = series.element;
      graph.series = series.series;
		  graph.series.active = function() { return graph.series.filter( function(s) { return !s.disabled } ); };

      graph.render();
    });
    this.putStatus(status);
  },

  getStatus: function() {
    var graph = this.graph;
    var origin_renderer = graph.renderer;
    var origin_series = graph.series;
    var origin_vis = graph.vis;
    var origin_stackedData = graph.stackedData;
    var origin_x = graph.x;
    var origin_y = graph.y;

    return {
      renderer:    origin_renderer,
      series:      origin_series,
      vis:     origin_vis,
      stackedData: origin_stackedData,
      x: origin_x,
      y: origin_y
    };
  },

  putStatus: function(status) {
    var graph = this.graph;
    if (status.hasOwnProperty('renderer')) 
      graph.renderer = status['renderer'];
    if (status.hasOwnProperty('series')) 
      graph.series = status['series'];
    if (status.hasOwnProperty('vis')) 
      graph.vis = status['vis'];
    if (status.hasOwnProperty('stackedData')) 
      graph.stackedData = status['stackedData'];
    if (status.hasOwnProperty('x')) 
      graph.x = status['x'];
    if (status.hasOwnProperty('y')) 
      graph.y = status['y'];
  }
} );

