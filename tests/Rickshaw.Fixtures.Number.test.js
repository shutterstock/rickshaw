const { Fixtures } = require('../rickshaw');
const { Number: NumberFixtures } = Fixtures;

describe('Rickshaw.Fixtures.Number', () => {
  describe('formatKMBT', () => {
    const testCases = [
      { input: 0, expected: '0' },
      { input: 1, expected: 1 },
      { input: 0.1, expected: '0.10' },
      { input: 123456, expected: '123.46K' },
      { input: 1000000000000.54, expected: '1.00T' },
      { input: 1000000000.54, expected: '1.00B' },
      { input: 98765432.54, expected: '98.77M' },
      { input: -12345, expected: '-12.35K' }
    ];

    testCases.forEach(({ input, expected }) => {
      test(`formats ${input} to ${expected}`, () => {
        const result = NumberFixtures.formatKMBT(input);
        if (typeof expected === 'number') {
          expect(result).toBe(expected);
        } else {
          expect(String(result)).toBe(expected);
        }
      });
    });
  });

  describe('formatBase1024KMGTP', () => {
    const testCases = [
      { input: 0, expected: '0' },
      { input: 1, expected: 1 },
      { input: 0.1, expected: '0.10' },
      { input: 123456, expected: '120.56K' },
      { input: 1125899906842624.54, expected: '1.00P' },
      { input: 1099511627778, expected: '1.00T' },
      { input: 1073741824, expected: '1.00G' },
      { input: 1048576, expected: '1.00M' },
      { input: -12345, expected: '-12.06K' }
    ];

    testCases.forEach(({ input, expected }) => {
      test(`formats ${input} to ${expected}`, () => {
        const result = NumberFixtures.formatBase1024KMGTP(input);
        if (typeof expected === 'number') {
          expect(result).toBe(expected);
        } else {
          expect(String(result)).toBe(expected);
        }
      });
    });
  });
});
