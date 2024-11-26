module.exports = {
  testEnvironment: 'jsdom',
  moduleDirectories: ['node_modules'],
  testMatch: ['**/tests/**/*.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!**/node_modules/**',
  ],
  setupFiles: ['./jest.setup.js'],
  transform: {},
  testEnvironmentOptions: {
    url: 'http://localhost/'
  }
};
