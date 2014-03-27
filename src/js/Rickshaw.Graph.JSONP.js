Rickshaw.namespace('Rickshaw.Graph.JSONP');

Rickshaw.Graph.JSONP = Rickshaw.Class.create( Rickshaw.Graph.Ajax, {

	request: function() {

		jQuery.ajax( {
			url: this.dataURL,
			dataType: 'jsonp',
			jsonp: this.args.callbackParameter || 'callback',
			success: this.success.bind(this),
			error: this.error.bind(this)
		} );
	}
} );
