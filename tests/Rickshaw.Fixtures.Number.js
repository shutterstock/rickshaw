var Number = require('../rickshaw').Fixtures.Number;

exports.formatKMBT = function(test) {

  var formatted = Number.formatKMBT(0);
  test.equal(formatted, '');

  formatted = Number.formatKMBT(1);
  test.equal(formatted, 1);

  formatted = Number.formatKMBT(0.1);
  test.equal(formatted, '0.10');

  formatted = Number.formatKMBT(123456);
  test.equal(formatted, '123.456K');

  formatted = Number.formatKMBT(1000000000000.54);
  test.equal(formatted, '1.00000000000054T');

  formatted = Number.formatKMBT(1000000000.54);
  test.equal(formatted, '1.00000000054B');

  formatted = Number.formatKMBT(098765432.54);
  test.equal(formatted, '98.76543254M');

  formatted = Number.formatKMBT(-12345);
  test.equal(formatted, '-12.345K');

  test.done();
};

exports.formatBase1024KMGTP = function(test) {

  var formatted = Number.formatBase1024KMGTP(0);
  test.equal(formatted, '');

  formatted = Number.formatBase1024KMGTP(1);
  test.equal(formatted, 1);

  formatted = Number.formatBase1024KMGTP(0.1);
  test.equal(formatted, '0.10');

  formatted = Number.formatBase1024KMGTP(123456);
  test.equal(formatted, '120.5625K');

  formatted = Number.formatBase1024KMGTP(1125899906842624.54);
  test.equal(formatted, '1.0000000000000004P');

  formatted = Number.formatBase1024KMGTP(1099511627778);
  test.equal(formatted, '1.000000000001819T');

  formatted = Number.formatBase1024KMGTP(1073741825);
  test.equal(formatted, '1.0000000009313226G');

  formatted = Number.formatBase1024KMGTP(1048579);
  test.equal(formatted, '1.0000028610229492M');

  formatted = Number.formatBase1024KMGTP(-12345);
  test.equal(formatted, '-12.0556640625K');

  test.done();
};
