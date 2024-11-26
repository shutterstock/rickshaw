const Rickshaw = require('../rickshaw');

describe('Rickshaw.Series.FixedDuration', () => {
  // Helper function to create test series data
  const createSeriesData = () => ({
    name: 'series1',
    data: [
      { x: 0, y: 20 },
      { x: 1, y: 21 },
      { x: 2, y: 15 }
    ],
    color: 'red'
  });

  test('is a function', () => {
    expect(typeof Rickshaw.Series.FixedDuration).toBe('function');
  });

  describe('initialization', () => {
    test('throws error without timeInterval', () => {
      expect(() => {
        new Rickshaw.Series.FixedDuration(
          [createSeriesData()],
          'spectrum2001',
          { timeBase: 0, maxDataPoints: 2000 }
        );
      }).toThrow('FixedDuration series requires timeInterval');
    });

    test('throws error without maxDataPoints', () => {
      expect(() => {
        new Rickshaw.Series.FixedDuration(
          [createSeriesData()],
          'spectrum2001',
          { timeBase: 0, timeInterval: 30 }
        );
      }).toThrow('FixedDuration series requires maxDataPoints');
    });

    test('initializes with valid parameters', () => {
      const series = new Rickshaw.Series.FixedDuration(
        [createSeriesData()],
        'spectrum2001',
        {
          timeBase: 0,
          timeInterval: 30,
          maxDataPoints: 2000
        }
      );

      expect(series).toBeInstanceOf(Rickshaw.Series.FixedDuration);
      expect(series).toBeInstanceOf(Array);
      // Check if series has array-like behavior
      expect(series.length).toBeGreaterThan(0);
      expect(series[0]).toBeDefined();
    });
  });

  describe('addData', () => {
    test('maintains maxDataPoints limit', () => {
      const maxPoints = 20;
      const series = new Rickshaw.Series.FixedDuration(
        [createSeriesData()],
        'spectrum2001',
        {
          timeBase: 0,
          timeInterval: 1,
          maxDataPoints: maxPoints
        }
      );

      // Add data points beyond maxDataPoints limit
      for (let i = 0; i < 300; i++) {
        series.addData({ series1: 42 });
      }

      // series[0].data.length is maxPoints + 2 because of how Rickshaw handles
      // data point interpolation at the edges of the time window
      expect(series[0].data.length).toBe(maxPoints + 2);
      expect(series.currentSize).toBe(maxPoints);
    });
  });
});
