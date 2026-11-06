import type { Page } from '@playwright/test'

import { expect, test } from '../support'

const expectSubmittedContent = async (
  page: Page,
  isMobile: boolean,
  content: string
) => {
  const endpoint = '/api/v3/channels/mobile-person/messages'
  await page.route('**' + endpoint, route => route.fulfill({ json: {} }))
  const request = page.waitForRequest(
    request =>
      request.method() === 'POST' &&
      new URL(request.url()).pathname === endpoint
  )
  const send = page.getByTestId('send')
  if (isMobile) await send.tap()
  else await send.click()
  expect((await request).postDataJSON()).toEqual({ content })
  await expect(page.getByTestId('posts')).toHaveText('1')
}

for (const markdown of [false, true]) {
  test(`submits hand-typed names as plain text with Markdown ${markdown}`, async ({
    page,
    input,
    load,
    isMobile
  }) => {
    const text = '@alice #times'
    await load({ text: '', markdown })
    await input.focus()
    await page.keyboard.insertText(text)
    await input.press('Escape')
    await expect(input.locator('.reference-token')).toHaveCount(0)
    await expect(page.getByTestId('source')).toHaveText(text)
    await expectSubmittedContent(page, isMobile, text)
  })

  for (const reference of [
    { type: 'user', id: '11111111-1111-4111-8111-111111111111', raw: '@alice' },
    { type: 'channel', id: 'mobile-times', raw: '#times' }
  ]) {
    test(`submits reopened ${reference.type} as text with Markdown ${markdown}`, async ({
      page,
      input,
      load,
      isMobile
    }) => {
      await load({ text: '!' + JSON.stringify(reference), markdown })
      await expect(input.locator('.reference-token')).toHaveText(reference.raw)
      await input.press('End')
      await input.press('Backspace')
      await input.press('Escape')
      await expect(input.locator('.reference-token')).toHaveCount(0)
      await expect(page.getByTestId('source')).toHaveText(reference.raw)
      await expectSubmittedContent(page, isMobile, reference.raw)
    })
  }

  test(`preserves selected reference IDs alongside plain names with Markdown ${markdown}`, async ({
    page,
    input,
    load,
    isMobile
  }) => {
    await load({ text: '', markdown })
    await input.focus()
    await page.keyboard.insertText('@al')
    const candidate = page
      .getByRole('grid', { name: '入力候補' })
      .getByRole('gridcell', { name: '@alice', exact: true })
    if (isMobile) await candidate.tap()
    else await candidate.click()
    await expect(input.locator('.reference-token')).toHaveText('@alice')
    const selected =
      '!{"type":"user","id":"11111111-1111-4111-8111-111111111111","raw":"@alice"} '
    await expect(page.getByTestId('source')).toHaveJSProperty(
      'textContent',
      selected
    )
    await page.keyboard.insertText('#times')
    await input.press('Escape')
    await expect(input.locator('.reference-token')).toHaveCount(1)
    await expectSubmittedContent(page, isMobile, selected + '#times')
  })
}

test('consumes a submission once and starts a fresh undo history', async ({
  page,
  input,
  load,
  modifier,
  isMobile
}) => {
  const { promise: response, resolve: finish } = Promise.withResolvers<void>()
  let requests = 0

  await page.route('**/api/v3/channels/mobile-person/messages', async route => {
    requests++
    await response
    await route.fulfill({ json: {} })
  })

  await load({ text: '', markdown: true })
  await input.fill('sent message')
  if (isMobile) await page.getByTestId('send').tap()
  else await input.press(`${modifier}+Enter`)
  await expect(input).toHaveAttribute('aria-readonly', 'true')
  if (!isMobile) await expect(input).toBeFocused()
  await expect.poll(() => requests).toBe(1)
  await page.getByTestId('send').click()
  expect(requests).toBe(1)

  finish()
  await expect(page.getByTestId('posts')).toHaveText('1')
  await expect(page.getByTestId('source')).toHaveText('')
  await expect(input).toHaveAttribute('aria-readonly', 'false')
  await input.press(`${modifier}+z`)
  await expect(page.getByTestId('source')).toHaveText('')
})

test('preserves a failed submission and permits retry', async ({
  page,
  input,
  load,
  modifier,
  isMobile
}) => {
  let requests = 0
  await page.route('**/api/v3/channels/mobile-person/messages', route => {
    requests++
    return route.fulfill({ status: requests === 1 ? 500 : 201, json: {} })
  })

  await load({ text: 'retry this draft', markdown: true })
  if (isMobile) await page.getByTestId('send').tap()
  else await input.press(`${modifier}+Enter`)
  await expect.poll(() => requests).toBe(1)
  await expect(input).toHaveAttribute('aria-readonly', 'false')
  await expect(page.getByTestId('source')).toHaveText('retry this draft')
  await expect(page.getByTestId('posts')).toHaveText('0')

  if (isMobile) await page.getByTestId('send').tap()
  else await input.press(`${modifier}+Enter`)
  await expect(page.getByTestId('posts')).toHaveText('1')
  await expect(page.getByTestId('source')).toHaveText('')
  expect(requests).toBe(2)
})

test('switches identical drafts by document identity', async ({
  page,
  input,
  load,
  modifier
}) => {
  await load({ documentKey: 'first', text: '', markdown: false })
  await input.fill('same content')
  await load({ documentKey: 'second', text: 'same content', markdown: false })
  await input.press(`${modifier}+z`)
  await expect(page.getByTestId('source')).toHaveText('same content')
})
