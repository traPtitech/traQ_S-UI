import { defineConfig, devices } from '@playwright/test'

const baseURL = 'http://127.0.0.1:4174/tests/e2e/editor/'
const mobileSpecs = [
  '**/mobileTouch.spec.ts',
  '**/messageSubmission.spec.ts',
  '**/stampEffectButton.spec.ts',
  '**/referenceLayout.spec.ts'
]

export default defineConfig({
  testDir: './tests/e2e/editor/specs',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  workers: 2,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'tests/e2e/report/editor', open: 'never' }]
  ],
  outputDir: 'tests/e2e/results/editor',
  use: {
    baseURL,
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  webServer: {
    command: 'npx vite --config tests/e2e/editor/vite.config.ts',
    url: baseURL,
    timeout: 120_000
  },
  projects: [
    {
      name: 'chromium',
      use: devices['Desktop Chrome'],
      testIgnore: '**/mobileTouch.spec.ts'
    },
    {
      name: 'firefox',
      use: devices['Desktop Firefox'],
      testIgnore: '**/mobileTouch.spec.ts'
    },
    {
      name: 'webkit',
      use: devices['Desktop Safari'],
      testIgnore: '**/mobileTouch.spec.ts'
    },
    {
      name: 'mobile-chromium',
      use: devices['Pixel 7'],
      testMatch: [...mobileSpecs, '**/mobileComposition.spec.ts']
    },
    {
      name: 'mobile-webkit',
      use: devices['iPhone 13'],
      testMatch: mobileSpecs
    },
    {
      name: 'tablet-webkit',
      use: devices['iPad Pro 11'],
      testMatch: [...mobileSpecs, '**/mobileInput.spec.ts']
    }
  ]
})
