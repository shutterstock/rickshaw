Rickshaw.namespace('Rickshaw.Graph.Technicals');

Rickshaw.Graph.Technicals = {
	
	renderForm : function(fields, elem){
		$('technical_form').html('');
		var form_top = '<form><fieldset>';
		var form_fields = '';
		var form_bottom = '<button class="btn">Submit</button></fieldset></form>';
		for(var key in fields){
			var obj = fields[key];
			form_fields += '<label for="' + obj.name + '">' + obj.name + '</label>';
			if(obj.type == 'int'){
				form_fields += '<input name="' + obj.name + '" id="' + obj.name + '" />';
			}
			if(obj.curve_sel){
				form_fields += 	'<label for="datum">Datum</label><select name="datum"></select>';
			}
		}
		elem.html(form_top + form_fields + form_bottom);
		var markup='';
		for(var i = 0; i<graph.series.length; i++){
			markup += "<option value='" + i + "'>" + graph.series[i].name + "</option>";
		}
		elem.find('form select').html(markup);
		return elem.find('button');
	},

	// Fast stochastic oscillator is a momentum indicator that uses support and resistance levels
	// %K = 100((curr - L)/(H-L))
	f_stochastic : function(elem, graph) {
		// constructor
		var name = this.name = "fast stochastic";
		var graph = this.graph = graph;
		this.fields = [{
				name : "%K period",
				type : "int",
				curve_sel : true
			},
			{
				name : "%D period",
				type : "int",
				curve_sel : false
			}
		];
		var self = this;
		Rickshaw.Graph.Technicals.renderForm(this.fields, elem).on('click', function(e){
			e.preventDefault();
			self.calc({
				graph: self.graph,
				datum: elem.find('form select option:selected').val(),
				period: elem.find('form input[name=period]').val()
			});
		});

		this.calc = function(args){
			var graph = this.graph = args.graph;
			var period = this.period = args.period;
			var datum = this.datum = args.datum;

			var nums = [];
			var res_arr = [];
			var length = graph.series[datum].data.length;
			var period_high, period_low;
	
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
			return res_obj;
		}
		this.draw = function(args){
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
		}
	},
	// Momentum is the absolute difference m = d(today) - d(n days ago)
	momentum : {
		name : "mementum",
		fields : {
			name : "period",
			type : "int",
			curve_sel : true
		}, 
		calc : function(args) {
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
			})
		}
	},

	// Simple moving average
	sma : {
		name : "simple moving average",
		fields : {
			name : "period",
			type : "int",
			curve_sel : true
		}, 
		calc : function(args) {
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
}