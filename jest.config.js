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
      branches: 59,
      functions: 62,
      lines: 67,
      statements: 66,
    }
  },
  setupFiles: ['./jest.setup.js'],
  transform: {},
  testEnvironmentOptions: {
    url: 'http://localhost/'
  }
};
