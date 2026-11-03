import { expect, test } from '../support/fixtures'

test('keeps a selected reference ID through posting, rendering and editing', async ({
  authenticatedPage: page,
  testData
}) => {
  await page.goto(`/channels/${testData.channelName}`)
  const input = page.getByTestId('message-input-editor')
  await input.fill(`@${testData.username}`)
  await input.press('End')
  await page
    .getByRole('gridcell', { name: `@${testData.username}`, exact: true })
    .click()
  await expect(input.locator('.reference-token')).toHaveText(
    `@${testData.username}`
  )
  await page.keyboard.insertText('reference integration')

  const posting = page.waitForResponse(
    response =>
      response.request().method() === 'POST' &&
      response.url().endsWith(`/channels/${testData.channelId}/messages`)
  )
  await page.getByTestId('message-send-button').click()
  const posted = await posting
  expect(posted.status()).toBe(201)
  const message = (await posted.json()) as { id: string; content: string }
  expect(
    JSON.parse(message.content.slice(1, message.content.indexOf('}') + 1))
  ).toEqual({
    type: 'user',
    raw: `@${testData.username}`,
    id: testData.userId
  })

  await page.reload()
  const rendered = page.locator(`[data-message-id="${message.id}"]`)
  await expect(rendered.locator('.markdown-body')).toContainText(
    'reference integration'
  )
  await rendered.hover()
  await rendered.getByTestId('message-edit-button').click()
  const editor = rendered.getByTestId('message-input-editor')
  await expect(editor.locator('.reference-token')).toHaveText(
    `@${testData.username}`
  )
  await editor.press('ControlOrMeta+End')
  await page.keyboard.insertText(' updated')
  const saving = page.waitForResponse(
    response =>
      response.request().method() === 'PUT' &&
      response.url().endsWith(`/messages/${message.id}`)
  )
  await rendered.getByRole('button', { name: 'OK', exact: true }).click()
  const saved = await saving
  expect(saved.status()).toBe(204)
  expect(saved.request().postDataJSON().content).toBe(
    `${message.content} updated`
  )
  await expect(rendered.locator('.markdown-body')).toContainText(
    'reference integration updated'
  )
})

test('uses the chosen channel ID in a command palette search request', async ({
  authenticatedPage: page,
  testData
}) => {
  await page.goto(`/channels/${testData.channelName}`)
  await page.route('**/api/v3/messages?*', route =>
    route.fulfill({ json: { hits: [], totalHits: 0 } })
  )
  await expect(page.getByTestId('channel-viewport')).toBeVisible()
  await page.keyboard.press('Control+Shift+f')
  const input = page.getByRole('combobox', { name: 'メッセージを検索' })
  await input.fill(`in:#${testData.channelName}`)
  await input.press('End')
  await page
    .getByRole('gridcell', { name: `#${testData.channelName}`, exact: true })
    .click()
  await expect(input.locator('.reference-token')).toHaveText(
    `in:#${testData.channelName}`
  )

  const searching = page.waitForRequest(
    request => new URL(request.url()).pathname === '/api/v3/messages'
  )
  await input.press('Enter')
  expect(new URL((await searching).url()).searchParams.get('in')).toBe(
    testData.channelId
  )
})

test('keeps another channel draft when a pending post completes', async ({
  authenticatedPage: page,
  testData
}) => {
  const navigate = async (channel: string) => {
    await page.evaluate(path => {
      history.pushState({}, '', path)
      dispatchEvent(new PopStateEvent('popstate'))
    }, `/channels/${channel}`)
    await expect(page).toHaveURL(new RegExp(`/channels/${channel}$`))
  }

  await page.goto(`/channels/${testData.secondChannelName}`)
  const input = page.getByTestId('message-input-editor')
  await input.fill('second draft')
  await navigate(testData.channelName)
  await expect(input).toHaveText('')
  await input.fill('first message')

  let release: () => void = () => undefined
  const gate = new Promise<void>(resolve => {
    release = resolve
  })
  let captured: () => void = () => undefined
  const capturedRequest = new Promise<void>(resolve => {
    captured = resolve
  })
  await page.route(
    `**/api/v3/channels/${testData.channelId}/messages`,
    async route => {
      if (route.request().method() === 'POST') {
        captured()
        await gate
      }
      await route.continue()
    }
  )

  try {
    await page.getByTestId('message-send-button').click()
    await capturedRequest
    await navigate(testData.secondChannelName)
    await expect(input).toHaveText('second draft')
    release()
    await expect(input).toHaveAttribute('aria-readonly', 'false')
    await expect(input).toHaveText('second draft')
    await navigate(testData.channelName)
    await expect(input).toHaveText('')
  } finally {
    release()
  }
})
