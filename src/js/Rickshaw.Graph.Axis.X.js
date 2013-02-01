Rickshaw.namespace('Rickshaw.Graph.Axis.X');

Rickshaw.Graph.Axis.X = function(args) {

	var self = this;
	
	this.initialise = function() {
	
		this.graph = args.graph;
		this.elements = [];
		this.ticksTreatment = args.ticksTreatment || 'plain';
		this.xSegments = args.xSegments || 10;
		
	};

	this.tickOffsets = function() {

		var domain = this.graph.x.domain();

		var range = Math.ceil(domain[1] - domain[0]);
		var segment = range / self.xSegments;
		var unit = self.graph.

		var runningTick = domain[0];

		var offsets = [];

		for (var i = 0; i < self.xSegments; i++) 
		{			
			runningTick = domain[0] + (i * segment);
			offsets.push( { value: runningTick, unit: unit } );
		}

		return offsets;
	};

	this.render = function() {

		this.elements.forEach( function(e) {
			e.parentNode.removeChild(e);
		} );

		this.elements = [];

		var offsets = this.tickOffsets();

		offsets.forEach( function(o) 
		{			
			if (self.graph.x(o.value) > self.graph.x.range()[1]) return;
	
			var element = document.createElement('div');
			element.style.left = self.graph.x(o.value) + 'px';
			element.classList.add('x_tick');
			element.classList.add(self.ticksTreatment);

			var title = document.createElement('div');
			title.classList.add('title');
			title.innerHTML = o.unit.formatter(new Date(o.value * 1000));
			element.appendChild(title);

			self.graph.element.appendChild(element);
			self.elements.push(element);

		} );
	};

	this.graph.onUpdate( function() { self.render() } );
};

