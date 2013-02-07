Rickshaw.namespace('Rickshaw.Graph.Line.XEqualsY');

Rickshaw.Graph.Line.XEqualsY = function(args) {

	var self = this;
	
	this.initialize = function(args) {
	
        if(!args.graph)
        {
            throw {
                name: "No graph exception",
                message: "You must associate this component with a graph."
            };
        }
        
		this.graph = args.graph;
        this.color = args.color || "black";
        this.lineOpacity = args.lineOpacity || 0.9;
        this.lineDashArray = args.lineDashArray || ('1,0');

        this.graph.onUpdate(function () {
            self.render();
        });
		
	},
	
	this.render = function() {
		
		if(self.line)
		{
			self.line.remove();
		}
		
		var x = self.graph.x;
		var y = self.graph.y;
		
		var xy0 = Math.floor(Math.min(x.domain()[0], y.domain()[0]));		
		var xy1 = Math.ceil(Math.max(x.domain()[1], y.domain()[1]));
				
		self.line = self.graph.vis
            .append("svg:line")
            .attr("x1", xy0)
            .attr("y1", xy0)
            .attr("x2", x(xy1))
            .attr("y2", y(xy1))
            .attr("opacity", self.lineOpacity)
            .style("stroke", self.color)
            .style("stroke-width", "1")
            .style("stroke-dasharray", self.lineDashArray);
	}
	
	this.initialize(args);
};