Rickshaw.namespace('Rickshaw.Technicals.calcs');

Rickshaw.Technicals.calcs = {
	// Momentum is the absolute difference m = d(today) - d(n days ago)
	momentum : {
		name : "momentum",
		independent : true,
		fields : [{
			name : "period",
			id : "p",
			type : "int",
			curve_sel : true
		}], 
		calc : function(args) {
			var period = this.period = args.period['period'];
			var datum = this.datum = args.datum;
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
			};
		}
	},
	// Simple moving average
	sma : {
		independent : false,
		name : "simple moving average",
		fields : [{
			name : "period",
			id : "p",
			type : "int",
			curve_sel : true
		}], 
		calc : function(args) {
			var period = this.period = args.period['period'];
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
			};
		}
	},
	// Fast stochastic oscillator is a momentum indicator that uses support and resistance levels
	// %K = 100((curr - L)/(H-L))
	// %D = 3-day SMA of %K
	f_stochastic : {
		// constructor
		name : "fast stochastic",
		independent : true,
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
					if(typeof period_high === "undefined" || nums[i] > period_high) period_high = nums[i]; 
					if(typeof period_low === "undefined" || nums[i] < period_low) period_low = nums[i];
				}

				var k = 100*(curr_obj.y - period_low)/(period_high - period_low);
				if(isNaN(k)) k=0;
				res_arr.push({ x: curr_obj.x, y0: curr_obj.y0, y: k });
			}
			var sma_period = [];
			sma_period['period'] = period['%d'];
			return {
				'%k' : res_arr,
				'%d' : Rickshaw.Technicals.calcs.sma.calc({
					datum: res_arr, 
					period: sma_period
				})['sma']
			};
		}
	}
};
