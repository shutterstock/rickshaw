Rickshaw.namespace('Rickshaw.Fixtures.Number');

Rickshaw.Fixtures.Number.formatKMBT = function(y) {
	if (y >= 1000000000000)   { return y / 1000000000000 + "T" } 
	else if (y >= 1000000000) { return y / 1000000000 + "B" } 
	else if (y >= 1000000)    { return y / 1000000 + "M" } 
	else if (y >= 1000)       { return y / 1000 + "K" }
	else if (y < 1 && y > 0)  { return y.toFixed(2) }
	else if (y == 0)          { return '' }
	else                      { return y }
}
