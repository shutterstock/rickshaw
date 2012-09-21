var vows = require('vows'), 
assert = require('assert');
require('../src/js/Rickshaw') 
require('../src/js/Rickshaw.Graph.Technicals.js');
require('../src/js/Rickshaw.Fixtures.RandomData.js');

vows.describe('Technicals').addBatch({ // Batch
	'A Technical Chart' : { // Context
		'calc a sma' : { // Sub-Context
			topic : function() {
				var seriesData = [ [], [], [] ];
				var period = 30;
				var random = new Rickshaw.Fixtures.RandomData(150);
				for (var i = 0; i < 150; i++) {
					random.addData(seriesData);
				}
				
				var calc = Rickshaw.Graph.Technicals.sma.calc({
					datum: seriesData[0], 
					period: period
				});
				return calc;
			},

			'returns an array' : function(topic) { // Vow
				assert.equal(topic['sma'].length, 150);
			}
		}
	}
}).export(module);