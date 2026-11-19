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

  test('shows cached user detail while refetching on reopening user modal', async ({
    authenticatedPage: page
  }) => {
    const userModal = page.getByTestId('usermodal')
    const bio = userModal.locator(
      '[data-testid="usermodal-bio"] [aria-busy=false]'
    )
    const isUserDetailUrl = (url: URL) =>
      /^\/api\/v3\/users\/[0-9a-f-]{36}$/.test(url.pathname)

    await page.getByTestId('my-icon-button').click()
    await expect(bio).toHaveText(userBio)
    await page.keyboard.press('Escape')
    await expect(userModal).toBeHidden()

    // 再取得の応答を止めて、その間もキャッシュから表示されることを確かめる
    let releaseResponse!: () => void
    const responseReleased = new Promise<void>(resolve => {
      releaseResponse = resolve
    })
    await page.route(isUserDetailUrl, async route => {
      await responseReleased
      await route.continue()
    })
    const refetchRequest = page.waitForRequest(request =>
      isUserDetailUrl(new URL(request.url()))
    )

    try {
      await page.getByTestId('my-icon-button').click()
      await refetchRequest
      await expect(bio).toHaveText(userBio)
    } finally {
      releaseResponse()
    }
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
