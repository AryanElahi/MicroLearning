module.exports = {
  testEnvironment: "node",
  setupFiles: ["<rootDir>/tests/setupEnv.js"],
  collectCoverageFrom: ["src/**/*.js", "!src/index.js", "!src/scripts/**"],
  clearMocks: true,
};
