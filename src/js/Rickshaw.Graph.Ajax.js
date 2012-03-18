Rickshaw.namespace('Graph.Ajax');

Rickshaw.Graph.Ajax = function(args) {

	var self = this;
	this.dataURL = args.dataURL;

	$.ajax( {
		url: this.dataURL,
		complete: function(response, status) {

			if (status === 'error') {
				console.log("error loading dataURL: " + this.dataURL);
			}

			var data = JSON.parse(response.responseText);	

			if (typeof args.onData === 'function') {
				var processedData = args.onData(data);
				data = processedData;
			}

			if (args.series) {

				args.series.forEach( function(s) {

					var seriesKey = s.key || s.name;
					if (!seriesKey) throw "series needs a key or a name";
					
					data.forEach( function(d) {

						var dataKey = d.key || d.name;
						if (!dataKey) throw "data needs a key or a name";
		
						if (seriesKey == dataKey) {
							var properties = ['color', 'name', 'data'];
							properties.forEach( function(p) {
								s[p] = s[p] || d[p];
							} );
						}
					} );
				} );

			} else {
				args.series = data;
			}

			self.graph = new Rickshaw.Graph(args);
			self.graph.render();

			if (typeof args.onComplete == 'function') {
				args.onComplete(self);
			}
		}
	} );
};

