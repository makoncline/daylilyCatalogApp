const { defineConfig } = require("cypress");
const rootUrl = process.env.CYPRESS_ROOT_URL || process.env.ROOT_URL;
if (!rootUrl) throw new Error("ROOT_URL is required for browser tests");

function setupNodeEvents(_on, config) {
  if (process.env.CI) {
    // CI seems to be pretty slow, lets be more forgiving
    config.defaultCommandTimeout = 20000; // default 4000
    config.requestTimeout = 10000; // default 5000
  }
  return config;
}

module.exports = defineConfig({
  e2e: {
    baseUrl: rootUrl,
    specPattern: "cypress/integration/**/*.spec.ts",
    supportFile: "cypress/support/index.js",
    setupNodeEvents,
  },
});
