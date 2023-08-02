// @ts-check
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  packageManager: 'yarn',
  reporters: ['html', 'clear-text', 'progress'],
  testRunner: 'jest',
  coverageAnalysis: 'perTest',
  jest: {
    configFile: 'jest.config.ts',
  },
  mutate: ['avro*.ts', 'utils.ts'],
  checkers: ['typescript'],
  typescriptChecker: {
    prioritizePerformanceOverAccuracy: true,
  },
  thresholds: { high: 80, low: 60, break: 30 },
  cleanTempDir: 'always',
};
export default config;
