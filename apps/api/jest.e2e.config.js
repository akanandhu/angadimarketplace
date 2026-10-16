module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.e2e-spec\\.ts$',
  transform: { '^.+\\.ts$': 'ts-jest' },
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  setupFiles: ['<rootDir>/test/support/env.ts'],
  globalSetup: '<rootDir>/test/support/global-setup.ts',
  maxWorkers: 1,
  testTimeout: 30000,
};
