Rickshaw.namespace('Rickshaw.Graph.Unstacker');

Rickshaw.Graph.Unstacker = function(args) {

	this.graph = args.graph;
	var self = this;

	this.graph.stackData.hooks.after.push( {
		name: 'unstacker',
		f: function(data) {

			if (!self.graph.renderer.unstack) return data;

			data.forEach( function(seriesData) {
				seriesData.forEach( function(d) {
					d.y0 = 0;
				} );
			} );

			return data;
		}
	} );
};

