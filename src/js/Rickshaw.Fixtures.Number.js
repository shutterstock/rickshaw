Rickshaw.namespace('Rickshaw.Fixtures.Number');

Rickshaw.Fixtures.Number.formatKMBT = function(y) {
	var abs_y = Math.abs(y);
	if (abs_y >= 1000000000000)      { return (y / 1000000000000).toFixed(2) + "T" }
	else if (abs_y >= 1000000000)    { return (y / 1000000000).toFixed(2) + "B" }
	else if (abs_y >= 1000000)       { return (y / 1000000).toFixed(2) + "M" }
	else if (abs_y >= 1000)          { return (y / 1000).toFixed(2) + "K" }
	else if (abs_y < 1 && abs_y > 0) { return y.toFixed(2) }
	else if (abs_y === 0)            { return '0' }
	else                             { return y }
};

Rickshaw.Fixtures.Number.formatBase1024KMGTP = function(y) {
	var abs_y = Math.abs(y);
	if (abs_y >= 1125899906842624)   { return (y / 1125899906842624).toFixed(2) + "P" }
	else if (abs_y >= 1099511627776) { return (y / 1099511627776).toFixed(2) + "T" }
	else if (abs_y >= 1073741824)    { return (y / 1073741824).toFixed(2) + "G" }
	else if (abs_y >= 1048576)       { return (y / 1048576).toFixed(2) + "M" }
	else if (abs_y >= 1024)          { return (y / 1024).toFixed(2) + "K" }
	else if (abs_y < 1 && abs_y > 0) { return y.toFixed(2) }
	else if (abs_y === 0)            { return '0' }
	else                             { return y }
};
