import { defineConfig, devices } from '@playwright/test'

const baseURL = 'http://127.0.0.1:4175/tests/e2e/virtual-scroll/'

export default defineConfig({
  testDir: './tests/e2e/virtual-scroll/specs',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  workers: 2,
  timeout: 30_000,
  expect: { timeout: 10_000 },

  reporter: [
    ['list'],
    ['html', { outputFolder: 'tests/e2e/report/virtual-scroll', open: 'never' }]
  ],

  outputDir: 'tests/e2e/results/virtual-scroll',

  use: {
    baseURL,
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },

  webServer: {
    command: 'npx vite --config tests/e2e/virtual-scroll/vite.config.ts',
    url: baseURL,
    timeout: 120_000
  },

  projects: [
    { name: 'chromium', use: devices['Desktop Chrome'], grepInvert: /@touch/ },

    {
      name: 'firefox',
      workers: 1,
      use: devices['Desktop Firefox'],
      grepInvert: /@touch/
    },

    { name: 'webkit', use: devices['Desktop Safari'], grepInvert: /@touch/ },
    { name: 'mobile-chromium', use: devices['Pixel 7'] },

    {
      name: 'mobile-webkit',
      use: devices['iPhone 13'],
      grepInvert: /@chromium/
    },

    {
      name: 'tablet-webkit',
      use: devices['iPad Pro 11'],
      grepInvert: /@chromium/
    }
  ]
})
