"use strict"
Rickshaw.namespace('Rickshaw.Graph.Technicals');

Rickshaw.Graph.Technicals = {
	
	renderForm : function(formula, elem, graph){
		// set up shop
		var tech = this.tech = eval(Rickshaw.Graph.Technicals[formula]);
		var elem = this.elem = elem;
		var graph = this.graph = graph;
		var calc_obj;
		var datum = this.datum = null;
		var curve_sel = false;
		elem.html('');

		// start building the form
		var form_top = '<form><fieldset>';
		var form_fields = '';
		var form_bottom = '<button class="btn">Submit</button></fieldset></form>';
		for(var key in tech.fields){
			var obj = tech.fields[key];
			form_fields += '<label for="' + obj.name + '">' + obj.name + '</label>';
			if(obj.type == 'int'){
				form_fields += '<input name="' + obj.name + '" id="' + obj.name + '" />';
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
			var data = tech.calc({
				datum: self.graph.series[datum].data,
				period: elem.find('form input[name=period]').val()
			});
			self.calc_obj = {
				color: d3.rgb(graph.series[datum].color).brighter().toString(),
				data: data,
				name: graph.series[datum].name + ' ' + tech.name
			};
			// Draw the data on the passed graph or a new graph
			var tech_graph = Rickshaw.Graph.Technicals.draw({
				graph : graph,
				tech : tech,
				datum : self.calc_obj
			});
		});
	},
	draw : function(args){
		var graph = this.graph = args.graph;
		var tech = this.tech = args.tech;
		var datum = this.datum = args.datum;

		if(!tech.independant){
			graph.series.push(datum);
			graph.render();
			legend.addLine(graph.series[graph.series.length-1]);
			shelving.addAnchor(legend.lines[legend.lines.length-1]);		
		}
		else{
			// new graph
			$('body').append("<div id='tech_chart'></div>");
			var tech_chart = new Rickshaw.Graph( {
				element: document.getElementById("tech_chart"),
				width: graph.width,
				height: 100,
				renderer: 'line',
				series: [datum]
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
			var hoverDetail = new Rickshaw.Graph.HoverDetail( {
				graph: tech_chart
			});	
		}
	},
	// Fast stochastic oscillator is a momentum indicator that uses support and resistance levels
	// %K = 100((curr - L)/(H-L))
	f_stochastic : {
		// constructor
		name : "fast stochastic",
		independant : true,
		fields : [{
				name : "%K period",
				type : "int",
				curve_sel : true
			},
			{
				name : "%D period",
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
			return res_arr;
		}
	},
	// Momentum is the absolute difference m = d(today) - d(n days ago)
	momentum : {
		name : "mementum",
		independant : true,
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
				if(ele < period)
					res_arr.push({ x: datum[ele].x, y0: datum[ele].y0, y: 0 });
				else
					res_arr.push({ x: datum[ele].x, y0: datum[ele].y0, y: datum[ele].y - datum[ele-period].y });
			}
			return res_arr;
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
		        else
		        	res_arr.push({ x: datum[ele].x, y0: datum[ele].y0, y: sum/n});
			}
			return res_arr;
		}
	}
}