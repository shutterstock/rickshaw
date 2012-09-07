"use strict"
Rickshaw.namespace('Rickshaw.Graph.Technicals');

Rickshaw.Graph.Technicals = {
	
	renderForm : function(formula, elem, graph){
		// set up shop
		var tech = this.tech = eval(Rickshaw.Graph.Technicals[formula]);
		var elem = this.elem = elem;
		var graph = this.graph = graph;
		var datum = this.datum = null;
		var curve_sel = false;
		elem.html('');

		// start building the form
		var form_top = '<form><fieldset>';
		var form_fields = '';
		var form_bottom = '<input type="submit" class="btn" /></fieldset></form>';
		for(var key in tech.fields){
			var obj = tech.fields[key];
			form_fields += '<label for="' + obj.name + '">' + obj.name + '</label>';
			if(obj.type == 'int'){
				form_fields += '<input name="' + obj.name + '" id="' + obj.id + '" class="period" />';
			}
			if(obj.curve_sel){
				curve_sel = true;
			}
		}
		// loop through lines of passed graph and add them to <select>
		if(curve_sel){
			form_fields += 	'<label for="datum">Datum</label>';
		}
		form_fields += '<select name="datum">';
		for(var i = 0; i<graph.series.length; i++){
			if(i==0)
				form_fields += "<option value='" + i + "' selected>" + graph.series[i].name + "</option>";
			else
				form_fields += "<option value='" + i + "'>" + graph.series[i].name + "</option>";
		}
		form_fields += '</select>';
		// drop the form in the passed element
		elem.html(form_top + form_fields + form_bottom);

		// Listen to the form submission and process data accordingly
		var self = this;
		elem.find('form').on('submit', function(e){
			e.preventDefault();
			var datum = self.elem.find('form select option:selected').val();
			var calc_obj = [];
			var period = [];
			// could be multiple periods so we need to loop
			elem.find('form input.period').each(function(index) {
				period[$(this).attr('id')] = $(this).val();
			});
			// Run the calculator
			var data = tech.calc({
				datum: self.graph.series[datum].data,
				period: period
			});
			// create the series object that will be drawn on the graph
			for(var key in data){
				calc_obj.push({
					//color: d3.rgb(graph.series[datum].color).brighter().toString(),
					color: '#'+Math.floor(Math.random()*16777215).toString(16),
					data: data[key],
					name: key
				})
			}
			// Draw the data on the passed graph or a new graph
			var tech_graph = Rickshaw.Graph.Technicals.draw({
				graph : graph,
				tech : tech,
				series : calc_obj
			});
		});
	},
	draw : function(args){
		var graph = this.graph = args.graph;
		var tech = this.tech = args.tech;
		var series = this.series = args.series;

		if(!tech.independant){
			graph.series.push(series);
			graph.render();
			legend.addLine(graph.series[graph.series.length-1]);
			shelving.addAnchor(legend.lines[legend.lines.length-1]);		
		}
		else{
			// new graph
			if($('.tech_chart').length == 0)
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
	},
	// Fast stochastic oscillator is a momentum indicator that uses support and resistance levels
	// %K = 100((curr - L)/(H-L))
	// %D = 3-day SMA of %K
	f_stochastic : {
		// constructor
		name : "fast stochastic",
		independant : true,
		fields : [{
				name : "%K period",
				id : "%k",
				type : "int",
				curve_sel : true
			},
			{
				name : "%D period",
				id: "%d",
				type : "int",
				curve_sel : false
			}
		],
		calc : function(args){
			var period = this.period = args.period;
			var datum = this.datum = args.datum;
			var nums = [];
			var res_arr = [];
			var length = datum.length;
			var period_high, period_low;
	
			for(var ele = 0; ele<length; ele++){
				var curr_obj = datum[ele];
				nums.push(datum[ele].y);
		        if (nums.length > period['%k'])
		            nums.splice(0,1);  // remove the first element of the array
		        
		        for (var i in nums){
		        	if(typeof period_high == "undefined" || nums[i] > period_high) period_high = nums[i]; 
					if(typeof period_low == "undefined" || nums[i] < period_low) period_low = nums[i];
		        }
		       
				var k = 100*(curr_obj.y - period_low)/(period_high - period_low);
				if(isNaN(k)) k=0;
				res_arr.push({ x: curr_obj.x, y0: curr_obj.y0, y: k });
			}
			return {
				'%k' : res_arr,
				'%d' : Rickshaw.Graph.Technicals.sma.calc({
					datum: res_arr, 
					period: period['%d']
				})['sma']
			}
		}
	},
	// Momentum is the absolute difference m = d(today) - d(n days ago)
	momentum : {
		name : "mementum",
		independant : true,
		fields : [{
			name : "period",
			id : "p",
			type : "int",
			curve_sel : true
		}], 
		calc : function(args) {
			var period = this.period = args.period;
			var datum = this.datum = args.datum;
			var nums = [];
			var res_arr = [];
			var length = datum.length;
			for(var ele = 0; ele<length; ele++){
				if(ele < period['p'])
					res_arr.push({ x: datum[ele].x, y0: datum[ele].y0, y: 0 });
				else
					res_arr.push({ x: datum[ele].x, y0: datum[ele].y0, y: datum[ele].y - datum[ele-period['p']].y });
			}
			return {
				'momentum' : res_arr
			}
		}
	},

	// Simple moving average
	sma : {
		independant : false,
		name : "simple moving average",
		fields : [{
			name : "period",
			type : "int",
			curve_sel : true
		}], 
		calc : function(args) {
			var period = this.period = args.period;
			var datum = this.datum = args.datum;
			var nums = [];
			var res_arr = [];
			var length = datum.length;
			for(var ele = 0; ele<length; ele++){
				nums.push(datum[ele].y);
		        if (nums.length > period)
		            nums.splice(0,1);  // remove the first element of the array
		        var sum = 0;
		        for (var i in nums)
		            sum += nums[i];
		        var n = period;
		        if (nums.length < period)
		            n = nums.length;

		        if(ele < period)
					res_arr.push({ x: datum[ele].x, y0: datum[ele].y0, y: 0 });
		        else{
		        	if(isNaN(sum/n))
		        		res_arr.push({ x: datum[ele].x, y0: datum[ele].y0, y: 0 });
		        	else 
		        		res_arr.push({ x: datum[ele].x, y0: datum[ele].y0, y: sum/n });
		        }
			}
			return {
				'sma' : res_arr
			}
		}
	}
}