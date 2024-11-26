module.exports = {
  testEnvironment: 'jsdom',
  moduleDirectories: ['node_modules'],
  testMatch: ['**/**/*.test.js'],
  collectCoverageFrom: [
    'Rickshaw.*.js',
    'rickshaw.js',
    '!rickshaw.min.js',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 52,
      lines: 62,
      functions: 53,
      statements: 61,
    },
  },
  setupFiles: ['./jest.setup.js'],
  transform: {},
  testEnvironmentOptions: {
    url: 'http://localhost/'
  }
};
