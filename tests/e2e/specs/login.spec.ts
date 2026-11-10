import { expect, test } from '../support/fixtures'
import { initialMessage } from '../support/testData'

test.describe('Login', () => {
  test('will show login page', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.getByText('ログイン', { exact: true }).first()
    ).toBeVisible()
  })

  test('can login', async ({ page, testData }) => {
    await page.goto('/')
    const inputs = page.locator('form input')
    await inputs.nth(0).fill(testData.username)
    await inputs.nth(1).fill(testData.password)
    const response = page.waitForResponse(
      response =>
        response.request().method() === 'POST' &&
        new URL(response.url()).pathname === '/api/v3/login'
    )
    await inputs.nth(1).press('Enter')
    expect((await response).status()).toBe(204)
    await expect(page.getByTestId('my-icon-button')).toBeVisible()
    await page.goto(`/channels/${testData.channelName}`)
    await expect(page.getByTestId('channel-viewport')).toContainText(
      initialMessage
    )
  })
})
