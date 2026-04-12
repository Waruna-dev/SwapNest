export default {
  testEnvironment: "node",
  testTimeout: 60000,
  testMatch: ["**/tests/**/*.test.js"],
  setupFiles: ["<rootDir>/tests/setup/envSetup.js"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup/integrationSetup.js"],
  collectCoverageFrom: [
    "controllers/**/*.js",
    "routes/**/*.js",
    "middlewares/**/*.js",
    "!**/node_modules/**",
  ],
};
