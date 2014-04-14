Rickshaw.namespace('Rickshaw.Fixtures.Number');

Rickshaw.Fixtures.Number.formatKMBT = function(y) {
	var abs_y = Math.abs(y);
	if (abs_y >= 1000000000000)   { return y / 1000000000000 + "T" }
	else if (abs_y >= 1000000000) { return y / 1000000000 + "B" }
	else if (abs_y >= 1000000)    { return y / 1000000 + "M" }
	else if (abs_y >= 1000)       { return y / 1000 + "K" }
	else if (abs_y < 1 && y > 0)  { return y.toFixed(2) }
	else if (abs_y === 0)         { return '' }
	else                      { return y }
};

Rickshaw.Fixtures.Number.formatBase1024KMGTP = function(y) {
    var abs_y = Math.abs(y);
    if (abs_y >= 1125899906842624)  { return y / 1125899906842624 + "P" }
    else if (abs_y >= 1099511627776){ return y / 1099511627776 + "T" }
    else if (abs_y >= 1073741824)   { return y / 1073741824 + "G" }
    else if (abs_y >= 1048576)      { return y / 1048576 + "M" }
    else if (abs_y >= 1024)         { return y / 1024 + "K" }
    else if (abs_y < 1 && y > 0)    { return y.toFixed(2) }
    else if (abs_y === 0)           { return '' }
    else                        { return y }
};


Rickshaw.Fixtures.Number.formatKMBT_round = function(y,a,b,precision) {
        var abs_y = Math.abs(y);
        if (typeof precision === "undefined"){precision = 2;}
        if (abs_y >= 1000000000000)   { return (y / 1000000000000).toFixed(precision) + "T" }
        else if (abs_y >= 1000000000) { return (y / 1000000000).toFixed(precision) + "B" }
        else if (abs_y >= 1000000)    { return (y / 1000000).toFixed(precision) + "M" }
        else if (abs_y >= 1000)       { return (y / 1000).toFixed(precision) + "K" }
        else if (abs_y < 1 && y > 0)  { return y.toFixed(precision) }
        else if (abs_y === 0)         { return 0 }
        else                      { return y.toFixed(precision) }
};

Rickshaw.Fixtures.Number.formatBase1024KMGTP_round = function(y, a,b,precision) {
    var abs_y = Math.abs(y);
    if (typeof precision === "undefined"){precision = 2;}
    if (abs_y >= 1125899906842624)  { return (y / 1125899906842624).toFixed(precision) + "P" }
    else if (abs_y >= 1099511627776){ return (y / 1099511627776).toFixed(precision) + "T" }
    else if (abs_y >= 1073741824)   { return (y / 1073741824).toFixed(precision) + "G" }
    else if (abs_y >= 1048576)      { return (y / 1048576).toFixed(precision) + "M" }
    else if (abs_y >= 1024)         { return (y / 1024).toFixed(precision) + "K" }
    else if (abs_y < 1 && y > 0)    { return y.toFixed(2) }
    else if (abs_y === 0)           { return 0 }
    else                      { return y.toFixed(precision) }
};
