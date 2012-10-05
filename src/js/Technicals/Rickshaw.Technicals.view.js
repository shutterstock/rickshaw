Rickshaw.namespace('Rickshaw.Technicals.view');

Rickshaw.Technicals.view = {	
	
	// list of available technicals
	draw : function(args){
		var graph = this.graph = args.graph;
		var tech = this.tech = args.tech;
		var series = this.series = args.series;
		var legend = this.legend = args.legend;
		var shelving = this.shelving = args.shelving;

		if(!tech.independant){
			graph.series.push(series);
			graph.render();
			legend.addLine(graph.series[graph.series.length-1]);
			shelving.addAnchor(legend.lines[legend.lines.length-1]);		
		}
		else{
			// if there is only one series, put it in an array
			if(series.length === undefined) series = [series];
			// new graph
			if($('.tech_chart').length === 0)
				$('body').append("<div class='tech_chart'></div>");
			else 
				$('.tech_chart').html('');
			var tech_chart = new Rickshaw.Graph( {
				element: document.getElementsByClassName("tech_chart")[0],
				width: graph.width,
				height: 200,
				min : 'auto',
				renderer: 'line',
				series: series
			});
			tech_chart.render();

			var ticksTreatment = 'glow';
			var xAxis = new Rickshaw.Graph.Axis.Time( {
				graph: tech_chart
			});
			xAxis.render();
			var yAxis = new Rickshaw.Graph.Axis.Y( {
				graph: tech_chart,
				tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
				ticksTreatment: ticksTreatment
			} );
			yAxis.render();	
			var hover = new Rickshaw.Graph.HoverDetail( {
				graph: tech_chart
			});	
		}
	}
};