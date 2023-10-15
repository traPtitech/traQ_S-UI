import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4173',
    fixturesFolder: 'tests/e2e/fixtures',
    specPattern: 'tests/e2e/specs/**.{js,jsx,ts,tsx}',
    screenshotsFolder: 'tests/e2e/screenshots',
    videosFolder: 'tests/e2e/videos',
    supportFile: 'tests/e2e/support/index.ts',
    chromeWebSecurity: false
  }
})
