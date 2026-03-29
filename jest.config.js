/** @type {import('ts-jest').JestConfigWithTsJest} */
// Use TypeScript support in Jest config

module.exports = {
  preset: 'ts-jest', //Enable Jest to run TypeScript files
  testEnvironment: 'node', //Run tests in Node.js environment
  testPathIgnorePatterns: ['/node_modules/', '/dist/'], //Ignore tests inside node_modules and dist folders
  testMatch: ['**/tests/**/*.spec.ts'], //Run only .spec.ts test files inside tests folder
  collectCoverage: true, //Track how much code is tested
  coverageDirectory: 'coverage', //Store test reports in coverage folder
  coverageProvider: 'v8', //Use V8 engine for faster coverage calculation
  coverageReporters: ['json', 'lcov', 'text', 'clover'], //Generate coverage reports in multiple formats
  collectCoverageFrom: ['src/**/*.{js,ts}'], //Measure coverage only for source code in src folder
};
