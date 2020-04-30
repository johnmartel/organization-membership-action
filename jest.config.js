// eslint-disable-next-line no-undef
module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts', '!lib/**', '!node_modules/**'],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  moduleFileExtensions: ['js', 'ts', 'json'],
  preset: 'ts-jest',
  reporters: ['default', 'jest-junit'],
  setupFilesAfterEnv: ['jest-extended'],
  testEnvironment: 'node',
};
