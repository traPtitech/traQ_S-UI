import { randomUUID } from 'node:crypto'

import { expect, test } from '../support/fixtures'

test.describe('Main', () => {
  test('can show channel', async ({ authenticatedPage: page }) => {
    await page.goto('/channels/general')
    await expect(page.locator('.markdown-body').first()).toBeVisible()
  })

  test('can show user modal', async ({ authenticatedPage: page }) => {
    await page.goto('/channels/general')
    await expect(page.locator('.markdown-body').first()).toBeVisible()
    await page.getByTestId('my-icon-button').click()
    await expect(
      page
        .getByTestId('usermodal')
        .locator('[data-testid="usermodal-bio"] [aria-busy=false]')
    ).toBeVisible()
  })

  test('can send message', async ({ authenticatedPage: page }) => {
    await page.goto('/channels/ci-e2e-test')
    const message = `e2e message send test ${randomUUID()}`
    await page.getByTestId('message-input-textarea').fill(message)
    const response = page.waitForResponse(
      response =>
        response.request().method() === 'POST' &&
        /\/api\/v3\/channels\/[^/]+\/messages$/.test(
          new URL(response.url()).pathname
        )
    )
    await page.getByTestId('message-send-button').click()
    expect((await response).status()).toBe(201)
    await expect(page.getByTestId('channel-viewport')).toContainText(message)
  })
})
