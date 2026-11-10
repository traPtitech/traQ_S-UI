import { expect, test } from '../support/fixtures'
import { initialMessage, userBio } from '../support/testData'

test.describe('Main', () => {
  test.beforeEach(async ({ authenticatedPage: page, testData }) => {
    await page.goto(`/channels/${testData.channelName}`)
    await expect(page.getByTestId('channel-viewport')).toContainText(
      initialMessage
    )
  })

  test('can show channel', async ({ authenticatedPage: page }) => {
    await expect(page.locator('.markdown-body')).toContainText([initialMessage])
  })

  test('can show user modal', async ({ authenticatedPage: page }) => {
    await page.getByTestId('my-icon-button').click()
    await expect(
      page
        .getByTestId('usermodal')
        .locator('[data-testid="usermodal-bio"] [aria-busy=false]')
    ).toHaveText(userBio)
  })

  test('can send message', async ({ authenticatedPage: page }) => {
    const message = 'E2E message send test'
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
    await page.reload()
    await expect(page.getByTestId('channel-viewport')).toContainText(message)
  })
})
