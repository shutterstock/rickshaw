Rickshaw.namespace('Rickshaw.Graph.Bar.HoverDetail');

Rickshaw.Graph.Bar.HoverDetail = function(arguments)
{	
	var self = this;
	var legend = null;
	
	this.initialize = function(args)
	{
        if(!args.graph)
        {
            throw {
                name: "No graph exception",
                message: "You must associate this component with a graph."
            };
        }
        
        this.graph = args.graph;
        this.legendId = args.legendId || 'floating_legend';
        this.cssClasses = args.cssClasses || '';
        this.cssLeftOffset = args.cssLeftOffset || 20;
        this.cssTopOffset = args.cssTopOffset || 20;
        this.legendBuilder = args.legendBuilder || function(graph, data) { return data.name; };
        this.onItemClick = args.onItemClick || function(){};
        
        this.graph.onUpdate(self.render);
	};
	
	this.render = function()
	{
		if(legend)
		{
			legend.remove();
		}
		
		var items = self.graph.vis.selectAll('rect')
			.on('mouseover', self.onMouseOver)
			.on('mousemove', self.onMouseMove)
			.on('mouseout', self.onMouseOut);
		
		if(self.onItemClick)
		{
			items
				.attr('class', 'clickable')
				.on('click', self.onItemClick);
		}
	}
	
	this.onMouseOver = function(d, i)
	{
		var barData = d3.select(this)[0][0].__data__;
		
		legend = $("<div id='floating_legend'></div>");
		legend.html(self.legendBuilder(self.graph, barData));
		legend.addClass(self.cssClasses);
		legend.css('left', d3.event.clientX + self.cssLeftOffset + "px");
		legend.css('top', d3.event.clientY + self.cssTopOffset + "px");	
		
		//$(self.graph.element.parentNode).append(legend);
		$("body").append(legend);
	};
	
	this.onMouseMove = function(d, i)
	{
		legend.css('left', d3.event.clientX + self.cssLeftOffset + "px");
		legend.css('top', d3.event.clientY + self.cssTopOffset + "px");	
	};
	
	this.onMouseOut = function(d, i)
	{
		legend.remove();		
	};
	
	this.initialize(arguments);
};