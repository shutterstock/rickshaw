// Simple moving average
self.addEventListener('message', function(e) {
	var period = this.period = e.data.period['p'];
	var datum = this.datum = e.data.datum;
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
	self.postMessage(JSON.stringify(res_arr));
}, false);


