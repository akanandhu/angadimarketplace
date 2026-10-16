module.exports = {
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.ts$': ['ts-jest', { tsconfig: { types: ['node', 'jest'] } }] },
  testEnvironment: 'node',
};
