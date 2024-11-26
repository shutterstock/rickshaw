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
      branches: 54,
      functions: 56,
      lines: 62,
      statements: 61,
    }
  },
  setupFiles: ['./jest.setup.js'],
  transform: {},
  testEnvironmentOptions: {
    url: 'http://localhost/'
  }
};
