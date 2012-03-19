Rickshaw.namespace('Rickshaw.Fixtures.Number');

Rickshaw.Fixtures.Number.formatKMBT = function(y) {
	if (y >= 1000000000000)   { return y / 1000000000000 + "T" } 
	else if (y >= 1000000000) { return y / 1000000000 + "B" } 
	else if (y >= 1000000)    { return y / 1000000 + "M" } 
	else if (y >= 1000)       { return y / 1000 + "K" }
	else if (y < 1 && y > 0)  { return y.toFixed(2) }
	else if (y == 0)          { return '' }
	else                      { return y }
};

Rickshaw.Fixtures.Number.formatBase1024KMGTP = function(y) {
    if (y >= 1125899906842624)  { return y / 1125899906842624 + "P" }
    else if (y >= 1099511627776){ return y / 1099511627776 + "T" }
    else if (y >= 1073741824)   { return y / 1073741824 + "G" }
    else if (y >= 1048576)      { return y / 1048576 + "M" }
    else if (y >= 1024)         { return y / 1024 + "K" }
    else if (y < 1 && y > 0)    { return y.toFixed(2) }
    else if (y == 0)            { return '' }
    else                        { return y }
};
