import { type Locator, test as base, expect } from '@playwright/test'

import { type RowSample, sampleRows } from './geometry'
import type { ChannelFixture } from './harness'

declare global {
  interface Window {
    virtualScrollErrors: string[]
  }
}

export const test = base.extend<{
  load: (fixture?: ChannelFixture) => Promise<Locator>
}>({
  page: [
    async ({ page }, use) => {
      const errors: string[] = []
      page.on('pageerror', error => errors.push(error.message))

      await page.addInitScript(() => {
        window.virtualScrollErrors = []

        window.addEventListener('error', event => {
          if (event.message) window.virtualScrollErrors.push(event.message)
        })
      })

      await page.route('**/api/v3/**', async route => {
        const path = new URL(route.request().url()).pathname

        if (path === '/api/v3/meta') {
          await route.fulfill({
            json: { canonicalOrigin: 'http://127.0.0.1:4175' }
          })
        } else if (path === '/api/v3/users/me') {
          await route.fulfill({
            json: {
              id: 'me',
              name: 'e2e',
              displayName: 'E2E',
              state: 1,
              bot: false,
              iconFileId: 'icon',
              updatedAt: '2026-01-01T00:00:00Z',
              groups: [],
              homeChannel: null
            }
          })
        } else if (
          [
            '/api/v3/users',
            '/api/v3/groups',
            '/api/v3/stamps',
            '/api/v3/activity/onlines'
          ].includes(path)
        ) {
          await route.fulfill({ json: [] })
        } else {
          errors.push(
            `Unexpected API request: ${route.request().method()} ${path}`
          )

          await route.abort()
        }
      })

      await page.goto('./')
      await page.waitForFunction(() => !!window.virtualScrollHarness)
      await page.evaluate(() => window.virtualScrollHarness.ready)

      await use(page)

      expect(errors).toEqual([])
      expect(await page.evaluate(() => window.virtualScrollErrors)).toEqual([])
    },
    { scope: 'test', timeout: 60_000 }
  ],

  load: async ({ page }, use) => {
    await use(async (fixture = {}) => {
      await page.evaluate(
        fixture => window.virtualScrollHarness.load(fixture),
        fixture
      )

      const view = fixture.view ?? 'channels'
      const scroller =
        view === 'channels'
          ? page.getByTestId('channels-tab').getByRole('region', {
              name: 'チャンネル一覧'
            })
          : page.getByTestId(`${view}-scroll`)
      await expect(scroller.locator('[data-key]').first()).toBeVisible()

      if (fixture.view !== 'home') {
        await expect
          .poll(async () => {
            const sample = await scroller.evaluate(sampleRows)
            return Math.max(...sample.frames.map(frame => frame.gap))
          })
          .toBeLessThanOrEqual(1.5)
      }

      return scroller
    })
  }
})

export { expect }

export const row = (scroller: Locator, key: string) =>
  scroller.locator(`[data-key="${key}"]`)

export const expectCovered = (sample: RowSample) => {
  expect(sample.frames.length).toBeGreaterThan(0)

  const gap = Math.max(...sample.frames.map(frame => frame.gap))
  const gapFrame = sample.frames.find(frame => frame.gap === gap)

  expect(
    gap,
    `uncovered viewport height at ${gapFrame?.time.toFixed(1)} ms (scrollTop: ${gapFrame?.scrollTop}, animation: ${gapFrame?.animation ?? 'none'})`
  ).toBeLessThanOrEqual(1.5)

  expect(
    Math.max(...sample.frames.map(frame => frame.overlap)),
    'overlapping rows'
  ).toBeLessThanOrEqual(1.5)

  expect(
    Math.max(...sample.frames.map(frame => frame.rows.length)),
    'rendered rows must stay bounded'
  ).toBeLessThan(100)
}

export const scrollAndCheckCoverage = async (
  scroller: Locator,
  scrollTo: number,
  scrollDuration = 400
) => {
  const sample = await scroller.evaluate(sampleRows, {
    scrollTo,
    scrollDuration,
    duration: scrollDuration + 450
  })

  expectCovered(sample)
}
