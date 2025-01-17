const Rickshaw = require('../rickshaw');

describe('Rickshaw.Fixtures.Time', () => {
  const time = new Rickshaw.Fixtures.Time();

  describe('month handling', () => {
    const february = 1359676800;
    const march = 1362096000;

    test('handles month boundary', () => {
      const ceil = time.ceil(february, time.unit('month'));
      expect(ceil).toBe(february);
    });

    test('handles just before month boundary', () => {
      const ceil = time.ceil(february - 1, time.unit('month'));
      expect(ceil).toBe(february);
    });

    test('handles mid-month values', () => {
      const ceil = time.ceil(february + 1, time.unit('month'));
      expect(ceil).toBe(march);
    });

    test('handles December to January wrap', () => {
      const december2013 = 1385856000;
      const january2014 = 1388534400;
      const ceil = time.ceil(december2013 + 1, time.unit('month'));
      expect(ceil).toBe(january2014);
    });
  });

  describe('year handling', () => {
    const year2013 = 1356998400;

    test('handles year boundary', () => {
      const ceil = time.ceil(year2013, time.unit('year'));
      expect(ceil).toBe(year2013);
    });

    test('handles mid-year values', () => {
      const ceil = time.ceil(year2013 + 1, time.unit('year'));
      const year2014 = year2013 + 365 * 24 * 60 * 60;
      expect(ceil).toBe(year2014);
    });
  });
});
