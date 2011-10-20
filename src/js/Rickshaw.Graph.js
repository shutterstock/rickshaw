window.Rickshaw = window.Rickshaw || {};

Rickshaw.Graph = function(args) {

	this.element = args.element;
	this.interpolation = args.interpolation || 'cardinal';
	this.series = args.series;
	this.offset = 'zero';

	this.width = args.width;
	this.height = args.height

	this.window = {};

	this.updateCallbacks = [];

	var self = this;

	// TODO: validate series

	this.initialize = function(args) {

		this.series.active = function() { return self.series.filter( function(s) { return !s.disabled } ) };

		this.element.classList.add('rickshaw_graph');
		this.vis = d3.select(this.element)
			.append("svg:svg")
			.attr('width', this.width)
			.attr('height', this.height);

		var renderers = [
			Rickshaw.Graph.Renderer.Stack, 
			Rickshaw.Graph.Renderer.Line
		];
	
		renderers.forEach( function(r) {
			if (!r) return; 
			self.registerRenderer(new r( { graph: self } ));
		} );

		this.setRenderer(args.renderer || 'stack');
		this.discoverRange();
	}

	this.dataDomain = function() {
		
		// take from the first series
		var data = this.series[0].data;
		
		return [ data[0].x, data.slice(-1).shift().x ]; 

	}

	this.discoverRange = function() {

		var domain = this.renderer.domain();
	
		this.x = d3.scale.linear().domain(domain.x).range([0, this.width]);
		this.y = d3.scale.linear().domain(domain.y).range([0, this.height]);
		
	}

	this.render = function() {

		var stackedData = this.stackData();
		this.discoverRange();

		this.renderer.render();

		this.updateCallbacks.forEach( function(callback) {
			callback();
		} );
	}

	this.update = this.render;

  this.stackData = function() {

		var data = this.series.active()
			.map( function(d) { return d.data } )
			.map( function(d) { return d.filter( function(d) { return this._slice(d) }, this ) }, this); 

		this.stackData.hooks.data.forEach( function(entry) {
			data = entry.f.apply(self, [data]);
		} ); 

		var layout = d3.layout.stack();
		layout.offset( self.offset );

		var stackedData = layout(data);
	
		this.stackData.hooks.after.forEach( function(entry) {
			stackedData = entry.f.apply(self, [data]);
		} ); 

		var i = 0;
		this.series.forEach( function(series) {
			if (series.disabled) return;
			series.stack = stackedData[i++];
		} );

		this.stackedData = stackedData;
		return stackedData;
	}

	this.stackData.hooks = { data: [], after: [] };

	this._slice = function(d) {

		if (this.window.xMin || this.window.xMax) {
			
			var isInRange = true;
			
			if (this.window.xMin && d.x <= this.window.xMin) isInRange = false;
			if (this.window.xMax && d.x >= this.window.xMax) isInRange = false;
			
			return isInRange;
		}

		return true;
	}

	this.onUpdate = function(callback) {
		this.updateCallbacks.push(callback);
	}

	this.registerRenderer = function(renderer) {
		this._renderers = this._renderers || {};
		this._renderers[renderer.name] = renderer;			
	}
	
	this.setRenderer = function(name) {

		if (!this._renderers[name]) {
			throw "couldn't find renderer " + name;
		}
		this.renderer = this._renderers[name]; 
	}

	this.initialize(args);
}
