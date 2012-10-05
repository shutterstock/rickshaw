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
};