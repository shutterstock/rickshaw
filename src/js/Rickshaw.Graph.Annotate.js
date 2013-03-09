Rickshaw.namespace('Rickshaw.Graph.Annotate');

Rickshaw.Graph.Annotate = function(args) {

	var graph = this.graph = args.graph;
	this.elements = { timeline: args.element };
	
	var self = this;

	this.data = {};

	this.elements.timeline.classList.add('rickshaw_annotation_timeline');

	this.add = function(time, content, end_time) {
		self.data[time] = self.data[time] || {'boxes': []};
		self.data[time].boxes.push({content: content, end: end_time});
	};

	this.update = function() {

		Rickshaw.keys(self.data).forEach( function(time) {

			var annotation = self.data[time];
			var left = self.graph.x(time);

			if (left < 0 || left > self.graph.x.range()[1]) {
				if (annotation.element) {
					annotation.line.classList.add('offscreen');
					annotation.element.style.display = 'none';
				}

				annotation.boxes.forEach( function(box) {
					if ( box.rangeElement ) box.rangeElement.classList.add('offscreen');
				});

				return;
			}

			if (!annotation.element) {
				var element = annotation.element = document.createElement('div');
				element.classList.add('annotation');
				this.elements.timeline.appendChild(element);
				element.addEventListener('click', function(e) {
					element.classList.toggle('active');
					annotation.line.classList.toggle('active');
					annotation.boxes.forEach( function(box) {
						if ( box.rangeElement ) box.rangeElement.classList.toggle('active');
					});
				}, false);
					
			}

			annotation.element.style.left = left + 'px';
			annotation.element.style.display = 'block';

			annotation.boxes.forEach( function(box) {


				var element = box.element;

				if (!element) {
					element = box.element = document.createElement('div');
					element.classList.add('content');
					element.innerHTML = box.content;
					annotation.element.appendChild(element);

					annotation.line = document.createElement('div');
					annotation.line.classList.add('annotation_line');
					self.graph.element.appendChild(annotation.line);

					if ( box.end ) {
						box.rangeElement = document.createElement('div');
						box.rangeElement.classList.add('annotation_range');
						self.graph.element.appendChild(box.rangeElement);
					}

				}

				if ( box.end ) {

					var annotationRangeStart = left;
					var annotationRangeEnd   = Math.min( self.graph.x(box.end), self.graph.x.range()[1] );

					// annotation makes more sense at end
					if ( annotationRangeStart > annotationRangeEnd ) {
						annotationRangeEnd   = left;
						annotationRangeStart = Math.max( self.graph.x(box.end), self.graph.x.range()[0] );
					}

					var annotationRangeWidth = annotationRangeEnd - annotationRangeStart;

					box.rangeElement.style.left  = annotationRangeStart + 'px';
					box.rangeElement.style.width = annotationRangeWidth + 'px';

					box.rangeElement.classList.remove('offscreen');
				}

				annotation.line.classList.remove('offscreen');
				annotation.line.style.left = left + 'px';
			} );
		}, this );
	};

	this.graph.onUpdate( function() { self.update() } );
};
