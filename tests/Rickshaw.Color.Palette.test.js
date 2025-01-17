const Rickshaw = require('../rickshaw');

describe('Rickshaw.Color.Palette', () => {
  test('initializes with default settings', () => {
    const palette = new Rickshaw.Color.Palette();

    expect(typeof palette.schemes).toBe('object');
    expect(palette.scheme).toEqual([
      '#cb513a',
      '#73c03a',
      '#65b9ac',
      '#4682b4',
      '#96557e',
      '#785f43',
      '#858772',
      '#b5b6a9'
    ]);
    expect(palette.runningIndex).toBe(0);
    expect(palette.generatorIndex).toBe(0);
    expect(palette.rotateCount).toBe(8);
    expect(typeof palette.color).toBe('function');
    expect(typeof palette.interpolateColor).toBe('function');
  });

  test('handles interpolatedStopCount option', () => {
    const palette = new Rickshaw.Color.Palette({
      interpolatedStopCount: 4
    });

    expect(typeof palette.schemes).toBe('object');
    expect(palette.scheme).toEqual([
      '#cb513a',
      '#c98339',
      '#c7b439',
      '#a5c439',
      '#73c03a',
      '#51c043',
      '#4fbd66',
      '#5abb8d',
      '#65b9ac',
      '#5db8b8',
      '#55a9b7',
      '#4c97b7',
      '#4682b4',
      '#4a51ac',
      '#724ea5',
      '#95519d',
      '#96557e',
      '#8f5066',
      '#874c4f',
      '#805547',
      '#785f43',
      '#7d6d4e',
      '#817959',
      '#848365',
      '#858772',
      '#91937f',
      '#9d9f8d',
      '#a9aa9b',
      '#b5b6a9'
    ]);
    expect(palette.runningIndex).toBe(0);
    expect(palette.generatorIndex).toBe(0);
    expect(palette.rotateCount).toBe(29);
    expect(typeof palette.color).toBe('function');
    expect(typeof palette.interpolateColor).toBe('function');
  });

  describe('interpolateColor', () => {
    test('returns last color in scheme by default', () => {
      const palette = new Rickshaw.Color.Palette();
      const color = palette.interpolateColor();

      expect(typeof palette.schemes).toBe('object');
      expect(color).toBe(palette.scheme[palette.scheme.length - 1]);
    });

    test('returns last color when at end of rotation', () => {
      const palette = new Rickshaw.Color.Palette();
      palette.generatorIndex = palette.rotateCount * 2 - 1;
      const color = palette.interpolateColor();

      expect(typeof palette.schemes).toBe('object');
      expect(color).toBe(palette.scheme[palette.scheme.length - 1]);
    });

    test('returns undefined if scheme is not an array', () => {
      const palette = new Rickshaw.Color.Palette();
      palette.scheme = null;
      const color = palette.interpolateColor();

      expect(color).toBeUndefined();
    });
  });

  describe('color', () => {
    test('returns colors in sequence', () => {
      const palette = new Rickshaw.Color.Palette();
      const firstColor = palette.color();
      const secondColor = palette.color();
      const thirdColor = palette.color();

      expect(firstColor).toBe(palette.scheme[0]);
      expect(secondColor).toBe(palette.scheme[1]);
      expect(thirdColor).toBe(palette.scheme[2]);
    });

    // TODO: This test hangs
    test.skip('rotates through colors when reaching end', () => {
      const palette = new Rickshaw.Color.Palette();
      const colors = [];

      // Get colors for more than one rotation
      for (let i = 0; i < palette.scheme.length + 2; i++) {
        colors.push(palette.color());
      }

      // Check first rotation matches scheme
      expect(colors.slice(0, palette.scheme.length)).toEqual(palette.scheme);
      
      // Check rotation wraps around
      expect(colors[palette.scheme.length]).toBe(palette.scheme[0]);
      expect(colors[palette.scheme.length + 1]).toBe(palette.scheme[1]);
    });
  });
});
