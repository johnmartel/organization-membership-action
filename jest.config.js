module.exports = {
  collectCoverage: false,
  collectCoverageFrom: ['src/**/*.ts', '!src/octokitTypes.ts', '!lib/**', '!node_modules/**'],
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
