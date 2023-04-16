module.exports = {
  "collectCoverage": false,
  "collectCoverageFrom": [
    "**/{src,tests,__tests__}/**/*.{ts,tsx,cts,mts,js,jsx,cjs,mjs}"
  ],
  "coverageDirectory": "./coverage",
  "coveragePathIgnorePatterns": [
    "node_modules/",
    "build/",
    "cjs/",
    "coverage/",
    "dist/",
    "dts/",
    "esm/",
    "lib/",
    "mjs/",
    "umd/"
  ],
  "coverageReporters": [
    "lcov",
    "text-summary"
  ],
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 90,
      "lines": 90,
      "statements": 90
    }
  },
  "globals": {
    "ts-jest": {
      "isolatedModules": true
    }
  },
  "moduleNameMapper": {
    "\\.(css|sass|scss|less|gif|png|jpg|jpeg|svg|gql|graphql|yml|yaml)$": "/Volumes/Projects/Software/GPT-3-Encoder/node_modules/jest-preset-beemo/lib/fileMock.js"
  },
  "setupFilesAfterEnv": [],
  "testEnvironment": "node",
  "testRunner": "jest-circus/runner",
  "transform": {
    "^.+\\.tsx?$": "ts-jest"
  },
  "extensionsToTreatAsEsm": [],
  "testMatch": [
    "<rootDir>/packages/*/src/**/*.test.{ts,tsx}",
    "<rootDir>/src/**/*.test.{ts,tsx}"
  ],
  "clearMocks": true
};