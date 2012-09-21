Rickshaw.namespace('Rickshaw.Graph.Technicals');

Rickshaw.Graph.Technicals = {
	
	// list of available technicals
	formulas : ['f_stochastic', 'momentum', 'sma'],

	renderForm : function(formula, elem, graph){
		"use strict";
		// set up shop
		var tech = this.tech = Rickshaw.Graph.Technicals[formula];
		this.elem = elem;
		this.graph = graph;
		var datum = this.datum = null;
		var curve_sel = false;
		var self = this;
		elem.html('');

		// start building the form
		var form_top = '<form><fieldset>';
		var form_fields = '';
		var form_bottom = '</fieldset></form>';

		// loop through formulas and create select
		form_fields += '<label for"technical">Select Technical:</label><select name="technical" id="tech-selector"><option value="-" selected></option>';
		for(var key in Rickshaw.Graph.Technicals.formulas){
			form_fields += "<option value='" + Rickshaw.Graph.Technicals.formulas[key] + "'>" + Rickshaw.Graph.Technicals.formulas[key] + "</option>";
		}
		form_fields += '</select>';

		// drop the form in the passed element
		elem.html(form_top + form_fields + form_bottom);

		// listen to technical select change
		elem.find('select').on('change', function(e){
			// clean existing form
			$('#tech-selector').nextAll().each(function(index) {
				$(this).remove();
			});
			tech = Rickshaw.Graph.Technicals[this.value];
			var form_fields = '';

			// loop through fields in selected technical
			for(var key in tech.fields){
				var obj = tech.fields[key];
				form_fields += '<label for="' + obj.name + '">' + obj.name + '</label>';
				if(obj.type === 'int'){
					form_fields += '<input name="' + obj.name + '" id="' + obj.id + '" class="period" />';
				}
				if(obj.curve_sel){
					curve_sel = true;
				}
			}
			// loop through lines of passed graph and add them to <select>
			if(curve_sel){
				form_fields += '<label for="datum">Datum</label>';
			}
			form_fields += '<select name="datum" id="datum_sel">';
			for(var i = 0; i<graph.series.length; i++){
				if(i===0)
					form_fields += "<option value='" + i + "' selected>" + graph.series[i].name + "</option>";
				else
					form_fields += "<option value='" + i + "'>" + graph.series[i].name + "</option>";
			}
			form_fields += '</select>';
			form_fields += '<input type="submit" class="btn" />';

			elem.find('fieldset').append(form_fields);
		});



		// Listen to the form submission and process data accordingly
		elem.find('form').on('submit', function(e){
			e.preventDefault();
			var datum = $('#datum_sel').val();
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
				// a technical can generate one or more lines
				if(Object.keys(data).length === 1){
					calc_obj = {
						//color: d3.rgb(graph.series[datum].color).brighter().toString(),
						color: '#'+Math.floor(Math.random()*16777215).toString(16),
						data: data[key],
						name: key
					};
				} else{
					calc_obj.push({
						//color: d3.rgb(graph.series[datum].color).brighter().toString(),
						color: '#'+Math.floor(Math.random()*16777215).toString(16),
						data: data[key],
						name: key
					});					
				}
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
			var sma_period = [];
			sma_period['p'] = period['%d'];
			return {
				'%k' : res_arr,
				'%d' : Rickshaw.Graph.Technicals.sma.calc({
					datum: res_arr, 
					period: sma_period
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
			var period = this.period = args.period['p'];
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
			id : "p",
			type : "int",
			curve_sel : true
		}], 
		calc : function(args) {
			var period = this.period = args.period['p'];
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