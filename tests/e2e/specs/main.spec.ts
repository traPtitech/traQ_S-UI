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

  test('can scroll history after leaving a large draft with an attachment', async ({
    authenticatedPage: page,
    testData
  }) => {
    await page.setViewportSize({ width: 1280, height: 720 })

    const channelName = `${testData.channelName}-log`
    const channelResponse = await page.request.post('/api/v3/channels', {
      data: { name: channelName }
    })
    await expect(channelResponse).toBeOK()

    const { id: channelId } = await channelResponse.json()
    const messagesPath = `/api/v3/channels/${channelId}/messages`
    const subscriptionResponse = await page.request.put(
      `/api/v3/users/me/subscriptions/${channelId}`,
      { data: { level: 1 } }
    )
    await expect(subscriptionResponse).toBeOK()

    for (let i = 1; i <= 30; i++) {
      const response = await page.request.post(messagesPath, {
        data: { content: `History message ${i}` }
      })
      await expect(response).toBeOK()
    }

    await page.reload()
    await page
      .getByTestId('message-input-textarea')
      .fill('Draft line\n'.repeat(80))

    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.getByTitle('ファイルを添付する').click()
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles({
      name: 'draft.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Unsent attachment')
    })
    await expect(page.getByText('draft.txt', { exact: true })).toBeVisible()

    await page.getByRole('link', { name: channelName, exact: true }).click()

    const viewport = page.getByTestId('channel-viewport')
    await expect(viewport.getByText('History message 30')).toBeInViewport()

    const olderMessages = page.waitForResponse(response => {
      const url = new URL(response.url())
      return (
        url.pathname === messagesPath &&
        url.searchParams.has('until') &&
        response.ok()
      )
    })
    const scroller = viewport.locator('..')
    await scroller.hover()
    await page.mouse.wheel(0, -1000)

    const response = await olderMessages
    const messages: { content: string }[] = await response.json()
    const oldestMessage = messages.at(-1)
    if (!oldestMessage) throw new Error('Expected an older history message')

    await expect(
      viewport.getByText(oldestMessage.content, { exact: true })
    ).toBeAttached()
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
