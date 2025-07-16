import { defineConfig } from 'cypress';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  env: {},

  e2e: {
    baseUrl: 'https://www.ottonova.de',
    chromeWebSecurity: false,
    experimentalInteractiveRunEvents: true,
    defaultCommandTimeout: 20000,
    downloadsFolder: './cypress/downloads',
    requestTimeout: 20000,
    responseTimeout: 60000,
    screenshotsFolder: './reports/screenshots',
    video: false,
    viewportWidth: 1600,
    viewportHeight: 1400,
    reporter: 'cypress-mochawesome-reporter',
    reporterOptions: {
      charts: true,
      embeddedScreenshots: true,
      inlineAssets: true,
      quiet: true,
      saveAllAttempts: false,
      saveHtml: false,
      saveJson: false,
      reportDir: './reports/mocha-reports',
      reportFilename: 'result-[name]',
      reportPageTitle: 'Test Report',
      overwrite: true,
      timestamp: false,
      jsonDir: './reports/mocha-reports',
      jsonFilename: 'result-[name].json',
    },

    setupNodeEvents(on) {
      on('task', {
        saveHtmlSnapshot({ testName, html }) {
          const saveName = testName.replace(/\s/g, '');
          const filePath = path.join(process.cwd(), './reports/snapshots', `${saveName}.html`);

          fs.mkdirSync(path.dirname(filePath), { recursive: true });
          fs.writeFileSync(filePath, html);

          return Promise.resolve(null);
        },
      });
    },
  },
});
