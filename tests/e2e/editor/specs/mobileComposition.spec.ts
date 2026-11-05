import { devices } from '@playwright/test'

import { caret, expect, test } from '../support'

const android = devices['Pixel 7']
if (!android) throw new Error('Missing Android device descriptor')

test.use({ userAgent: android.userAgent, hasTouch: true })
test.skip(
  ({ browserName }) => browserName !== 'chromium',
  'Uses Chromium native composition events'
)

for (const prefix of [':ok', '@al', ':@al', ':ok_hand.la']) {
  test(`shows mobile suggestions while composing ${prefix}`, async ({
    page,
    input,
    load
  }) => {
    await load({ text: '', markdown: true })
    await input.focus()
    const session = await page.context().newCDPSession(page)

    await session.send('Input.imeSetComposition', {
      text: prefix,
      selectionStart: prefix.length,
      selectionEnd: prefix.length
    })

    await expect(page.getByTestId('source')).toHaveText(prefix)
    await expect.poll(() => caret(input)).toMatchObject({ composing: true })
    const menu = page.getByRole('grid', { name: '入力候補' })
    await expect(menu).toBeVisible()

    await input.dispatchEvent('keydown', {
      key: 'Enter',
      keyCode: 229,
      isComposing: true
    })
    await expect(page.getByTestId('source')).toHaveText(prefix)
    await expect(page.getByTestId('posts')).toHaveText('0')

    await session.send('Input.insertText', { text: prefix })
    await expect.poll(() => caret(input)).toMatchObject({ composing: false })
    await session.detach()
  })
}

for (const [prefix, candidate, result] of [
  [':ok', ':ok_hand:', ':ok_hand: '],
  [':@al', '@alice', ':@alice: '],
  [':ok_hand.la', '.large', ':ok_hand.large: ']
] as const) {
  test(`commits composition before tapping ${candidate}`, async ({
    page,
    input,
    load
  }) => {
    await load({ text: '', markdown: true })
    await input.focus()
    const session = await page.context().newCDPSession(page)
    await session.send('Input.imeSetComposition', {
      text: prefix,
      selectionStart: prefix.length,
      selectionEnd: prefix.length
    })

    const menu = page.getByRole('grid', { name: '入力候補' })
    await menu.getByRole('gridcell', { name: candidate, exact: true }).tap()

    await expect(page.getByTestId('source')).toHaveJSProperty(
      'textContent',
      result
    )
    await expect
      .poll(() => caret(input))
      .toMatchObject({
        composing: false,
        focused: true
      })
    await expect(menu).toHaveCount(0)
    await input.press('x')
    await expect(page.getByTestId('source')).toHaveText(result + 'x')
    await expect(page.getByTestId('posts')).toHaveText('0')
    await session.detach()
  })
}

test('hides suggestions for a selected composition clause and non-ASCII input', async ({
  page,
  input,
  load
}) => {
  await load({ text: '', markdown: true })
  await input.focus()
  const session = await page.context().newCDPSession(page)
  const menu = page.getByRole('grid', { name: '入力候補' })

  for (const [text, anchor, head, shown] of [
    [':ok', 3, 3, true],
    [':ok', 1, 3, false],
    [':お', 2, 2, false],
    [':ok', 3, 3, true]
  ] as const) {
    await session.send('Input.imeSetComposition', {
      text,
      selectionStart: anchor,
      selectionEnd: head
    })
    await expect(page.getByTestId('source')).toHaveText(text)
    await expect(menu).toHaveCount(shown ? 1 : 0)
    await expect.poll(() => caret(input)).toMatchObject({ composing: true })
  }

  await session.send('Input.insertText', { text: ':ok' })
  await session.detach()
})

test('opens effect candidates from a composing stamp by touch', async ({
  page,
  input,
  load
}) => {
  await page.addStyleTag({
    content: '[data-testid="input-frame"] { margin-top: 240px; }'
  })
  await load({ text: '', markdown: true })
  await input.focus()
  const session = await page.context().newCDPSession(page)
  await session.send('Input.imeSetComposition', {
    text: ':ok',
    selectionStart: 3,
    selectionEnd: 3
  })
  const menu = page.getByRole('grid', { name: '入力候補' })
  await menu
    .getByRole('button', { name: ':ok_hand にエフェクトを追加', exact: true })
    .tap()

  await expect(page.getByTestId('source')).toHaveText(':ok_hand.')
  await expect
    .poll(() => caret(input))
    .toMatchObject({
      composing: false,
      focused: true
    })
  await menu.getByRole('gridcell', { name: '.large', exact: true }).tap()
  await expect(page.getByTestId('source')).toHaveJSProperty(
    'textContent',
    ':ok_hand.large: '
  )
  await expect(page.getByTestId('posts')).toHaveText('0')
  await session.detach()
})
