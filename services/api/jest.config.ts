import type { Config } from "jest";

const config: Config = {
  rootDir: ".",
  testEnvironment: "node",
  moduleFileExtensions: ["js", "json", "ts"],
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.spec.json"
      }
    ]
  },
  moduleNameMapper: {
    "^@packages/(.*)$": "<rootDir>/../../packages/$1"
  },
  collectCoverageFrom: ["src/**/*.(t|j)s"],
  coverageDirectory: "./coverage"
};

export default config;
