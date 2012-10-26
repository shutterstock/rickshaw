var Rickshaw = require('../rickshaw'), assert = require('assert');


////////////   UTILS
function seriesData(arg) {
  var data = {
	  constant : [ {x: 0, y: 0, y0: 0}, {x: 1, y: 1, y0: 0}, { x: 2, y: 2, y0: 0} , { x: 3, y: 3, y0: 0}, { x: 4, y: 4, y0: 0}, { x: 5, y: 5, y0: 0}, { x: 6, y: 6,y0: 0}, { x: 7, y: 7, y0: 0}, { x: 8, y: 8, y0: 0}],
    fib : [ {x: 0, y: 0, y0: 0}, {x: 1, y: 1, y0: 0}, { x: 1, y: 1, y0: 0} , { x: 2, y: 2, y0: 0}, { x: 3, y: 3, y0: 0}, { x: 5, y: 5, y0: 0}, { x: 8, y: 8,y0: 0}, { x: 13, y: 13, y0: 0}, { x: 21, y: 21, y0: 0}],
    prime : [ {x: 2, y: 2, y0: 0}, {x: 3, y: 3, y0: 0}, { x: 5, y: 5, y0: 0} , { x: 7, y: 7, y0: 0}, { x: 11, y: 11, y0: 0}, { x: 13, y: 13, y0: 0}, { x: 17, y: 17,y0: 0}, { x: 19, y: 19, y0: 0}, { x: 23, y: 23, y0: 0}]
  };
  return data[arg];
};


////////////   MOMENTUM
function momentum(sample_data, period, test, msg){
  var tech = new Rickshaw.Technicals.Momentum();
	    
  var data = tech.calc({
    datum: sample_data,
    period: period
	});

  for(var i in data.momentum){
    if(i < period['p']) continue;
	  test.equal(data.momentum[i].y, sample_data[i].y - sample_data[i-period['p']].y, msg);
  }
  test.done();
}

exports.constantMomentum = function(test) {
  var period = new Array();
  period['p'] = 1;
  var sample_data = seriesData('constant');
  momentum(sample_data, period, test, 'constant momentum');
};

exports.fibMomentum = function(test) {
  var period = new Array();
  period['p'] = 2;
  var sample_data = seriesData('fib');
  momentum(sample_data, period, test, 'fib momentum');
};
exports.primeMomentum = function(test) {
  var period = new Array();
  period['p'] = 3;
  var sample_data = seriesData('prime');
  momentum(sample_data, period, test, 'prime momentum');
};


////////////   SMA
function sma(sample_data, period, test, msg){
  var tech = new Rickshaw.Technicals.SMA();
	    
  var data = tech.calc({
    datum: sample_data,
    period: period
	});

  for(var i in data.momentum){
    if(i < period['p']) continue;
	  test.equal(data.momentum[i].y, sample_data[i].y - sample_data[i-period['p']].y, msg);
  }
  test.done();
}

exports.constantSMA = function(test) {
  var period = new Array();
  period['p'] = 1;
  var sample_data = seriesData('constant');
  momentum(sample_data, period, test, 'constant sma');
};

exports.fibMomentum = function(test) {
  var period = new Array();
  period['p'] = 2;
  var sample_data = seriesData('fib');
  momentum(sample_data, period, test);
};
exports.primeMomentum = function(test) {
  var period = new Array();
  period['p'] = 3;
  var sample_data = seriesData('prime');
  momentum(sample_data, period, test);
};
