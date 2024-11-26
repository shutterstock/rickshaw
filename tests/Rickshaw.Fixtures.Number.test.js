var Number = require('../rickshaw').Fixtures.Number;

exports.formatKMBT = function(test) {

  var formatted = Number.formatKMBT(0);
  test.equal(formatted, '0');

  formatted = Number.formatKMBT(1);
  test.equal(formatted, 1);

  formatted = Number.formatKMBT(0.1);
  test.equal(formatted, '0.10');

  formatted = Number.formatKMBT(123456);
  test.equal(formatted, '123.46K');

  formatted = Number.formatKMBT(1000000000000.54);
  test.equal(formatted, '1.00T');

  formatted = Number.formatKMBT(1000000000.54);
  test.equal(formatted, '1.00B');

  formatted = Number.formatKMBT(098765432.54);
  test.equal(formatted, '98.77M');

  formatted = Number.formatKMBT(-12345);
  test.equal(formatted, '-12.35K');

  test.done();
};

exports.formatBase1024KMGTP = function(test) {

  var formatted = Number.formatBase1024KMGTP(0);
  test.equal(formatted, '0');

  formatted = Number.formatBase1024KMGTP(1);
  test.equal(formatted, 1);

  formatted = Number.formatBase1024KMGTP(0.1);
  test.equal(formatted, '0.10');

  formatted = Number.formatBase1024KMGTP(123456);
  test.equal(formatted, '120.56K');

  formatted = Number.formatBase1024KMGTP(1125899906842624.54);
  test.equal(formatted, '1.00P');

  formatted = Number.formatBase1024KMGTP(1099511627778);
  test.equal(formatted, '1.00T');

  formatted = Number.formatBase1024KMGTP(1073741825);
  test.equal(formatted, '1.00G');

  formatted = Number.formatBase1024KMGTP(1048579);
  test.equal(formatted, '1.00M');

  formatted = Number.formatBase1024KMGTP(-12345);
  test.equal(formatted, '-12.06K');

  test.done();
};
