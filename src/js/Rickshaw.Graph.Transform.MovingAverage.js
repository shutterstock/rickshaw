Rickshaw.namespace('Rickshaw.Graph.Transform.MovingAverage');

Rickshaw.Graph.Transform.MovingAverage = Rickshaw.Class.create( Rickshaw.Graph.Transform, {

  initialize: function($super, args) {

    Rickshaw.extend(args, {
      name: 'movingAverage'
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
            self.setWindowSize(ui.value);
            self.graph.update();
          }
        } );
      } );
    }
  },

  transformer: function($super, data) {

    if (this.windowSize == 1) return data;

    return $super(data);
  },

  transformWindow: function(buffer, position, remaining) {

    if (position === 0) {
      this._avgY = 0;

      buffer.forEach( function(d) {
        this._avgY += d.y / buffer.length;
      }.bind(this) );

      this._removed = buffer[0];
      return [ { x: buffer[buffer.length - 1].x, y: this._avgY } ];
    }

    var added = buffer[buffer.length - 1];
    this._avgY += added.y / buffer.length;
    this._avgY -= this._removed.y / buffer.length;
    this._removed = buffer[0];

    return [ { x: added.x, y: this._avgY } ];
  }
});
