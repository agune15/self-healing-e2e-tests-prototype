import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents() {
      // implement node event listeners here
    },
  },
  env: {
    baseURL: "https://www.ottonova.de",
  },
});
