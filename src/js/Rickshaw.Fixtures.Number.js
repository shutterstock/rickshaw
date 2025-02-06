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

Rickshaw.Fixtures.Number.formatLog10KMBT = function(y) {
    var abs_y = Math.abs(y);
    if (abs_y >= 14)                { return "100T" }
    else if (abs_y >= 13)           { return "10T" }
    else if (abs_y >= 12)           { return "1T" }
    else if (abs_y >= 11)           { return "100B" }
    else if (abs_y >= 10)           { return "10B" }
    else if (abs_y >= 9)            { return "1B" }
    else if (abs_y >= 8)            { return "100M" }
    else if (abs_y >= 7)            { return "10M" }
    else if (abs_y >= 6)            { return "1M" }
    else if (abs_y >= 5)            { return "100K" }
    else if (abs_y >= 4)            { return "10K" }
    else if (abs_y >= 3)            { return "1000" }
    else if (abs_y >= 2)            { return "100" }
    else if (abs_y >= 1)            { return "10" }
    else if (abs_y < 1 && y > 0)    { return "1" }
    else if (abs_y === 0)           { return '' }
    else                        { return y }
};
