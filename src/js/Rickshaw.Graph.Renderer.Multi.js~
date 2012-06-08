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
    var defaultRenderer = graph.defaultRenderer || 'line';
    var seriesGroup = {};

    seriesGroup[defaultRenderer] =
      {series: [], element: null};

    var rendererOrder = ['area', 'line'];

    graph.series.forEach(function(series){
      var rendererName = defaultRenderer;
      if(series.hasOwnProperty('renderer')){
        rendererName = series.renderer;
      }
      if(!seriesGroup.hasOwnProperty(rendererName)){
        seriesGroup[rendererName] =
          {series: [], element: null};
      }
      seriesGroup[rendererName].series.push(series);
    });

    rendererOrder.forEach(function(rendererName){
      if(!seriesGroup.hasOwnProperty(rendererName))
        return;

      var series = seriesGroup[rendererName];
      var renderer = graph._renderers[rendererName];
      var element = d3.select('svg').append('svg:g').attr('class', rendererName);
      series.element = element;
      
      graph.renderer = renderer;
      graph.vis = series.element;
      graph.series = series.series;
		  graph.series.active = function() { return graph.series.filter( function(s) { return !s.disabled } ); };

      graph.render();
    });
  }
} );

