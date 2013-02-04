Rickshaw.namespace('Rickshaw.Graph.Axis.X');

Rickshaw.Graph.Axis.X = function(args) {

	var self = this;
	
	this.initialize = function() {
	
		this.graph = args.graph;
		this.elements = [];
		this.segmentation = typeof args.segmentation === 'undefined' || args.segmentation > 1 || args.segmentation <= 0 ? 0.25 : args.segmentation;
	};

	this.tickOffsets = function() {

		var domain = self.graph.x.domain();

		var range = Math.ceil(domain[1] - domain[0]);
		var segmentSize = Math.ceil(range * self.segmentation);
		var numberOfSegments = range / segmentSize;

		var runningTick = domain[0];

		var offsets = [];

		for (var i = 0; i <= numberOfSegments; i++) 
		{			
			runningTick = Math.ceil(domain[0] + (i * segmentSize));
			offsets.push( { value: runningTick } );
		}

		return offsets;
	};

	this.render = function() {

		self.elements.forEach( function(e) {
			e.parentNode.removeChild(e);
		} );

		self.elements = [];

		var offsets = self.tickOffsets();

		offsets.forEach( function(o) 
		{			
			if (self.graph.x(o.value) > self.graph.x.range()[1]) return;
	
			var element = document.createElement('div');
			element.style.left = self.graph.x(o.value) + 'px';
			element.classList.add('x_tick');
			element.classList.add(self.ticksTreatment);

			var title = document.createElement('div');
			title.classList.add('title');
			title.innerHTML = o.value;
			element.appendChild(title);

			self.graph.element.appendChild(element);
			self.elements.push(element);

		} );
	};

	this.initialize();
	this.graph.onUpdate( function() { self.render() } );
};

