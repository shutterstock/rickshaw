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
  setupFiles: ['./jest.setup.js'],
  transform: {},
  testEnvironmentOptions: {
    url: 'http://localhost/'
  }
};
