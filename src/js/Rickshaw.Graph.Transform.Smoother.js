Rickshaw.namespace('Rickshaw.Graph.Transform.Smoother');

// for back compat
Rickshaw.namespace('Rickshaw.Graph.Smoother');

Rickshaw.Graph.Smoother = Rickshaw.Graph.Transform.Smoother = Rickshaw.Class.create( Rickshaw.Graph.Transform, {

  initialize: function($super, args) {

    Rickshaw.extend(args, {
      name: 'smoother'
    } );

    $super(args);

  },

  build: function() {

    var self = this;

    if (this.element) {
      $( function() {
        $(self.element).slider( {
          min: 1,
          max: 100,
          slide: function( event, ui ) {
            self.setScale(ui.value);
            self.graph.update();
          }
        } );
      } );
    }
  },

  setScale: function(scale) {

    if (scale < 1) {
      throw "scale out of range: " + scale;
    }

    this.setWindowSize(scale);
  },

  transformer: function($super, data) {

    if (this.windowSize == 1) return data;

    return $super(data);
  },

  transformWindow: function(buffer, position, remaining) {

    if (position % this.windowSize !== 0) {
      // advance buffer more before smoothing
      return null;
    }

    var avgX = 0, avgY = 0;

    buffer.forEach( function(d) {
      avgX += d.x / buffer.length;
      avgY += d.y / buffer.length;
    } );

    return [ { x: avgX, y: avgY } ];
  }
} );
