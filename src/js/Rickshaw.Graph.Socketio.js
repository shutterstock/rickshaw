Rickshaw.namespace('Rickshaw.Graph.Socketio');

Rickshaw.Graph.Socketio = Rickshaw.Class.create( Rickshaw.Graph.Ajax, {
	request: function() {
		var socket = io.connect(this.dataURL);
		thisData = this;
		socket.on('rickshaw', function (data) {
			thisData.success(data);
		});
	}
} );
