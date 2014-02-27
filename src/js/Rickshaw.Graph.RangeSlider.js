Rickshaw.namespace('Rickshaw.Graph.RangeSlider');

Rickshaw.Graph.RangeSlider = Rickshaw.Class.create({

  initialize: function(args) {

    var element = this.element = args.element;
    var graph = this.graph = args.graph;

    this.slideCallbacks = [];

    this.build();

    graph.onUpdate( function() { this.update() }.bind(this) );
  },

  build: function() {

    var element = this.element;
    var graph = this.graph;
    var $ = jQuery;

    var domain = graph.dataDomain();
    var self = this;

    $( function() {
      $(element).slider( {
        range: true,
        min: domain[0],
        max: domain[1],
        values: [ 
          domain[0],
          domain[1]
        ],
        start: function ( event, ui ) {
          self.slideStarted(event,ui);
        },
        stop: function( event, ui ) {
          self.slideFinished(event, ui);
        },
        slide: function( event, ui ) {

          if (!self.slideShouldUpdate(event, ui))
            return;

          if (ui.values[1] <= ui.values[0]) return;

          self.processSlideChange(event, ui);
        }
      } );
    } );

    $(element)[0].style.width = graph.width + 'px';

  },

  update: function() {

    var element = this.element;
    var graph = this.graph;
    var $ = jQuery;

    var values = $(element).slider('option', 'values');

    var domain = graph.dataDomain();

    $(element).slider('option', 'min', domain[0]);
    $(element).slider('option', 'max', domain[1]);

    if (graph.window.xMin == null) {
      values[0] = domain[0];
    }
    if (graph.window.xMax == null) {
      values[1] = domain[1];
    }

    $(element).slider('option', 'values', values);
  },

  onSlide: function(callback) {
    this.slideCallbacks.push(callback);
  },

  processSlideChange: function(event, ui) {
    var graph = this.graph;

    graph.window.xMin = ui.values[0];
    graph.window.xMax = ui.values[1];
    graph.update();

    var domain = graph.dataDomain();

    // if we're at an extreme, stick there
    if (domain[0] == ui.values[0]) {
      graph.window.xMin = undefined;
    }

    if (domain[1] == ui.values[1]) {
      graph.window.xMax = undefined;
    }

    this.slideCallbacks.forEach(function(callback) {
      callback(graph, graph.window.xMin, graph.window.xMax);
    });
  },

  // allows the slide updates to bail out if sliding is not permitted
  slideShouldUpdate: function(event, ui) {
    return true;
  },

  slideStarted: function(event, ui) {
    return;
  },

  slideFinished: function(event, ui) {
    return;
  }
});

