import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      branches: 68,
      functions: 62,
      lines: 75,
      statements: -18,
    },
  },
};

export default config;
