Rickshaw.namespace('Rickshaw.Graph.Technicals');

Rickshaw.Graph.Technicals = {
	
	// Dast stochastic oscillator is a momentum indicator that uses support and resistance levels
	// %K = 100((curr - L)/(H-L))
	f_stochastic : function(args) {
		var element = this.element = args.element;
		var graph = this.graph = args.graph;
		var period = this.period = args.period;
		var datum = this.datum = args.datum;
		var self = this;

		var nums = [];
		var res_arr = [];
		var length = graph.series[datum].data.length;
		var period_high, period_low ;
		for(var ele = 0; ele<length; ele++){
			var curr_obj = graph.series[datum].data[ele];
			nums.push(graph.series[datum].data[ele].y);
	        if (nums.length > period)
	            nums.splice(0,1);  // remove the first element of the array
	        
	        for (var i in nums){
	        	if(typeof period_high == "undefined" || nums[i] > period_high) period_high = nums[i]; 
				if(typeof period_low == "undefined" || nums[i] < period_low) period_low = nums[i];
	        }
	       
			var k = 100*(curr_obj.y - period_low)/(period_high - period_low);
			if(isNaN(k)) k=0;
			res_arr.push({ x: curr_obj.x, y0: curr_obj.y0, y: k });
		}
		
		var res_obj = {
			color: d3.rgb(graph.series[datum].color).brighter().toString(),
			data: res_arr,
			name: graph.series[datum].name + ' fast stochastic'
		}

		$('body').append("<div id='f_stochastic_chart'></div>");
		var f_stochastic_chart = new Rickshaw.Graph( {
			element: document.getElementById("f_stochastic_chart"),
			width: graph.width,
			height: 100,
			renderer: 'line',
			series: [res_obj]
		});
		f_stochastic_chart.render();
		var momentum_axes = new Rickshaw.Graph.Axis.Time( {
			graph: f_stochastic_chart
		});
	},
	// Momentum is the absolute difference m = d(today) - d(n days ago)
	momentum : function(args) {
		var element = this.element = args.element;
		var graph = this.graph = args.graph;
		var period = this.period = args.period;
		var datum = this.datum = args.datum;
		var self = this;

		var nums = [];
		var res_arr = [];
		var length = graph.series[datum].data.length;
		for(var ele = 0; ele<length; ele++){
			if(ele < period)
				res_arr.push({ x: graph.series[datum].data[ele].x, y0: graph.series[datum].data[ele].y0, y: 0 });
			else
				res_arr.push({ x: graph.series[datum].data[ele].x, y0: graph.series[datum].data[ele].y0, y: graph.series[datum].data[ele].y - graph.series[datum].data[ele-period].y });
		}
		
		var res_obj = {
			color: d3.rgb(graph.series[datum].color).brighter().toString(),
			data: res_arr,
			name: graph.series[datum].name + ' momentum'
		}

		$('body').append("<div id='momentum_chart'></div>");
		var momentum_chart = new Rickshaw.Graph( {
			element: document.getElementById("momentum_chart"),
			width: graph.width,
			height: 100,
			renderer: 'line',
			series: [res_obj]
		});
		momentum_chart.render();
		var momentum_axes = new Rickshaw.Graph.Axis.Time( {
			graph: momentum_chart
		});
	},

	// Simple moving average
	sma : function(args) {
		var element = this.element = args.element;
		var graph = this.graph = args.graph;
		var period = this.period = args.period;
		var datum = this.datum = args.datum;
		var self = this;

		var nums = [];
		var res_arr = [];
		var length = graph.series[datum].data.length;
		for(var ele = 0; ele<length; ele++){
			nums.push(graph.series[datum].data[ele].y);
	        if (nums.length > period)
	            nums.splice(0,1);  // remove the first element of the array
	        var sum = 0;
	        for (var i in nums)
	            sum += nums[i];
	        var n = period;
	        if (nums.length < period)
	            n = nums.length;
	        res_arr.push({ x: graph.series[datum].data[ele].x, y0: graph.series[datum].data[ele].y0, y: sum/n});
		}
		
		var res_obj = {
			color: d3.rgb(graph.series[datum].color).brighter().toString(),
			data: res_arr,
			name: graph.series[datum].name + ' momentum'
		}
		
		graph.series.push(res_obj);
		graph.render();
		legend.addLine(graph.series[graph.series.length-1]);
		shelving.addAnchor(legend.lines[legend.lines.length-1]);
	}
}