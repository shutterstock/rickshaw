const Rickshaw = require('../rickshaw');

describe('Rickshaw.Series', () => {
  // Helper function to create consistent test data
  const createSeriesData = () => ({
    name: 'series1',
    data: [
      { x: 0, y: 20 },
      { x: 1, y: 21 },
      { x: 2, y: 15 }
    ],
    color: 'red'
  });

  // Helper to create a clean series instance
  const createSeries = (items = [createSeriesData()]) => {
    return new Rickshaw.Series(items, 'spectrum2001', { timeBase: 0 });
  };

  describe('initialization', () => {
    test('should be defined as a function', () => {
      expect(typeof Rickshaw.Series).toBe('function');
    });

    test('should create a valid series instance', () => {
      const series = createSeries();

      expect(series).toBeInstanceOf(Rickshaw.Series);
      expect(series).toBeInstanceOf(Array);
      expect(series[0].data).toEqual([
        { x: 0, y: 20 },
        { x: 1, y: 21 },
        { x: 2, y: 15 }
      ]);
    });
  });

  describe('addItem', () => {
    test('should add a new series item', () => {
      const series = createSeries();

      series.addItem({
        name: 'series2',
        data: [
          { x: 0, y: 10 },
          { x: 1, y: 13 },
          { x: 2, y: 12 }
        ]
      });

      expect(series.length).toBe(2);
      expect(series[1].name).toBe('series2');
      expect(series[1].data).toHaveLength(3);
    });
  });

  describe('addData', () => {
    test('should add data point to existing series', () => {
      const series = createSeries();

      series.addData({ series1: 22 });

      expect(series[0].data).toHaveLength(4);
      expect(series[0].data[3].y).toBe(22);
    });

    test('should add data points to multiple series', () => {
      const series = createSeries();
      series.addItem({
        name: 'series2',
        data: [
          { x: 0, y: 10 },
          { x: 1, y: 13 },
          { x: 2, y: 12 }
        ]
      });

      series.addData({ series1: 29, series2: 57 });

      expect(series[0].data[3].y).toBe(29);
      expect(series[1].data[3].y).toBe(57);
    });

    test('should add data with custom x-axis value', () => {
      const series = createSeries();

      series.addData({ series1: 22 }, 5);
      expect(series[0].data[3]).toEqual({ x: 5, y: 22 });

      series.addData({ series1: 29, series2: 57 }, 7);
      expect(series[0].data[4]).toEqual({ x: 7, y: 29 });
      expect(series[1].data[4]).toEqual({ x: 7, y: 57 });
    });
  });

  describe('itemByName', () => {
    test('should retrieve series by name', () => {
      const series = createSeries();
      const item = series.itemByName('series1');

      expect(item).toBe(series[0]);
      expect(item.name).toBe('series1');
    });

    test('should return undefined for non-existent series', () => {
      const series = createSeries();
      expect(series.itemByName('nonexistent')).toBeUndefined();
    });
  });

  describe('dump', () => {
    test('should dump series data in expected format', () => {
      const series = createSeries();

      expect(series.dump()).toEqual({
        timeBase: 0,
        timeInterval: 1,
        items: [{
          color: 'red',
          name: 'series1',
          data: [
            { x: 0, y: 20 },
            { x: 1, y: 21 },
            { x: 2, y: 15 }
          ]
        }]
      });
    });
  });

  describe('fill methods', () => {
    test('zeroFill should fill gaps with zeros', () => {
      const gappedData = [
        { name: 'series1', data: [{ x: 1, y: 22 }, { x: 3, y: 29 }] },
        { name: 'series2', data: [{ x: 2, y: 49 }] }
      ];
      const series = new Rickshaw.Series(gappedData, 'spectrum2001', { timeBase: 0 });
      
      Rickshaw.Series.zeroFill(series);

      // Verify each series data
      expect(series[0].data).toEqual([
        { x: 1, y: 22 },
        { x: 2, y: 0 },
        { x: 3, y: 29 }
      ]);
      expect(series[1].data).toEqual([
        { x: 1, y: 0 },
        { x: 2, y: 49 },
        { x: 3, y: 0 }
      ]);
    });

    test('fill should fill gaps with specified value', () => {
      const gappedData = [
        { name: 'series1', data: [{ x: 1, y: 22 }, { x: 3, y: 29 }] },
        { name: 'series2', data: [{ x: 2, y: 49 }] }
      ];
      const series = new Rickshaw.Series(gappedData, 'spectrum2001', { timeBase: 0 });
      const fillValue = null;

      Rickshaw.Series.fill(series, fillValue);

      // Verify each series data
      expect(series[0].data).toEqual([
        { x: 1, y: 22 },
        { x: 2, y: fillValue },
        { x: 3, y: 29 }
      ]);
      expect(series[1].data).toEqual([
        { x: 1, y: fillValue },
        { x: 2, y: 49 },
        { x: 3, y: fillValue }
      ]);
    });
  });

  describe('load', () => {
    test('should load series data from dump format', () => {
      const series = new Rickshaw.Series([], 'spectrum2001', { timeBase: 0 });
      const data = {
        items: [createSeriesData()],
        timeInterval: 3,
        timeBase: 0
      };

      series.load(data);
      delete series.palette; // Remove palette for comparison

      expect(series.timeBase).toBe(0);
      expect(series.timeInterval).toBe(3);
      expect(series[0].data).toHaveLength(3);
      expect(series[0].name).toBe('series1');
    });
  });
});
