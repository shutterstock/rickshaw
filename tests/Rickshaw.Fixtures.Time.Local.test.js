// Set timezone for consistent testing
process.env.TZ = 'America/New_York';

const Rickshaw = require('../rickshaw');

describe('Rickshaw.Fixtures.Time.Local', () => {
  const time = new Rickshaw.Fixtures.Time.Local();

  describe('month handling', () => {
    const february = 1359694800;
    const march = 1362114000;

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
      const december2013 = 1385874000;
      const january2014 = 1388552400;
      const ceil = time.ceil(december2013 + 1, time.unit('month'));
      expect(ceil).toBe(january2014);
    });
  });

  describe('year handling', () => {
    const year2013 = 1357016400;

    test('handles year boundary', () => {
      const ceil = time.ceil(year2013, time.unit('year'));
      expect(ceil).toBe(year2013);
    });

    test('handles mid-year values', () => {
      const ceil = time.ceil(year2013 + 1, time.unit('year'));
      const year2014 = 1388552400; // Jan 1, 2014 00:00:00 EST
      expect(ceil).toBe(year2014);
    });
  });

  // Add a test to verify timezone behavior
  test('uses correct timezone', () => {
    // February 1, 2013 00:00:00 EST
    const february = 1359694800;
    
    // Create a Date object from the timestamp
    const date = new Date(february * 1000);
    
    // Verify it's midnight in EST
    expect(date.getHours()).toBe(0);
    expect(date.getMinutes()).toBe(0);
    expect(date.getSeconds()).toBe(0);
    expect(date.getTimezoneOffset()).toBe(300); // EST is UTC-5, so offset is 300 minutes
  });
});
