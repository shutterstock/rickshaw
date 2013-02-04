Rickshaw.namespace('Rickshaw.Graph.Axis.X');

Rickshaw.Graph.Axis.X = function(args) {

	var self = this;
	
	this.initialize = function() {
	
		this.graph = args.graph;
		this.elements = [];
		this.segments = typeof args.segments === 'undefined' ? 10 : args.segments;
		this.segmentDecimalPlaces = typeof args.segmentDecimalPlaces  === 'undefined' ? 2 : args.segmentDecimalPlaces;
	};

	this.tickOffsets = function() {

		var domain = self.graph.x.domain();

		var range = Math.ceil(domain[1] - domain[0]);
		var segment = range / self.segments;

		var runningTick = domain[0];

		var offsets = [];

		for (var i = 0; i <= self.segments; i++) 
		{			
			runningTick = round(domain[0] + (i * segment), self.segmentDecimalPlaces);
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

	var round = function(number, decimalPlaces) {

		var multiplier = Math.pow(10, decimalPlaces);

		var roundedNumber = number * multiplier;
		roundedNumber = Math.round(roundedNumber);
		roundedNumber = Math.ceil(roundedNumber);

		return roundedNumber / multiplier;
	};

	this.initialize();
	this.graph.onUpdate( function() { self.render() } );
};

