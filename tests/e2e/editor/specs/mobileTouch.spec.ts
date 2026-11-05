import { caret, expect, test } from '../support'

test.beforeEach(async ({ page }) => {
  // Keep the composer at the viewport edge without changing production styles.
  await page.addStyleTag({
    content: `
      #app main { margin: 0; padding: 16px; }
      [data-testid="input-frame"] {
        position: fixed;
        bottom: 16px;
        left: 16px;
        right: 16px;
      }
      [data-testid="source"] { white-space: pre-wrap; overflow-wrap: anywhere; }
    `
  })
})

for (const mode of ['message', 'search'] as const) {
  test(`continues channel paths by touch in ${mode} mode`, async ({
    page,
    input,
    load
  }) => {
    if (mode === 'search') {
      await page.addStyleTag({
        content: '[data-testid="input-frame"] { top: 64px; bottom: auto; }'
      })
    }
    await load({ text: '', markdown: true, mode })
    await input.tap()
    const prefix = mode === 'search' ? 'in:' : ''
    await page.keyboard.insertText(prefix + '#ti')
    const menu = page.getByRole('grid', { name: '入力候補' })

    for (const path of ['#times', '#times/25']) {
      const button = menu.getByRole('button', {
        name: `${path} の子チャンネルを補完`,
        exact: true
      })
      // Mobile WebKit can clip a fraction of a CSS pixel at the scroll boundary.
      await expect(button).toBeInViewport({ ratio: 0.99 })
      const bounds = await button.boundingBox()
      expect(Math.round(bounds?.height ?? 0)).toBeGreaterThanOrEqual(44)
      await button.tap()
      await expect(page.getByTestId('source')).toHaveText(prefix + path)
      await expect(input.locator('.reference-token')).toHaveCount(0)
      await expect(input).toBeFocused()
    }

    await expect(
      menu.getByRole('group', { name: '補完のキーボード操作' })
    ).toHaveCount(0)
    await menu
      .getByRole('gridcell', { name: '#times/25/person', exact: true })
      .tap()

    const raw = prefix + '#times/25/person'
    const reference =
      mode === 'message'
        ? { type: 'channel', id: 'mobile-person', raw }
        : { type: 'search-in', id: 'mobile-person', raw, kind: 'channel' }
    const source = '!' + JSON.stringify(reference) + ' '
    await expect(page.getByTestId('source')).toHaveJSProperty(
      'textContent',
      source
    )
    await expect(input.locator('.reference-token')).toHaveText(raw)
    await expect(menu).toHaveCount(0)
    await expect(input).toBeFocused()
    await page.keyboard.insertText('x')
    await expect(page.getByTestId('source')).toHaveText(source + 'x')
    await expect(page.getByTestId('posts')).toHaveText('0')
  })
}

for (const markdown of [false, true]) {
  test(`keeps completion visible after the viewport shrinks with Markdown ${markdown}`, async ({
    page,
    input,
    load
  }) => {
    const viewport = page.viewportSize()
    if (!viewport) throw new Error('Missing mobile viewport')
    await load({ text: '', markdown })
    await input.tap()
    await page.keyboard.insertText(':ok')
    const menu = page.getByRole('grid', { name: '入力候補' })
    await expect(menu).toBeInViewport({ ratio: 1 })

    // This exercises resize handling, not an actual OS software keyboard.
    await page.setViewportSize({ width: viewport.width, height: 380 })
    await expect(input).toBeInViewport({ ratio: 1 })
    await expect(menu).toBeInViewport({ ratio: 1 })
    await expect
      .poll(async () => {
        const popup = await menu.boundingBox()
        const editor = await input.boundingBox()
        return popup && editor ? popup.y + popup.height <= editor.y : false
      })
      .toBe(true)

    await menu
      .getByRole('button', { name: ':ok_hand にエフェクトを追加', exact: true })
      .tap()
    await expect(page.getByTestId('source')).toHaveText(':ok_hand.')
    await expect(menu).toBeInViewport({ ratio: 1 })
    await menu.getByRole('gridcell', { name: '.large', exact: true }).tap()
    await expect(input).toBeFocused()
    await page.keyboard.insertText('x')
    await expect(page.getByTestId('source')).toHaveText(':ok_hand.large: x')
    await page.setViewportSize(viewport)
    await expect(input).toBeInViewport({ ratio: 1 })
    await expect(input).toBeFocused()
    await expect(page.getByTestId('posts')).toHaveText('0')
  })
}

test('scrolls suggestions with a touch gesture without selecting a stamp', async ({
  browserName,
  page,
  input,
  load
}) => {
  test.skip(browserName !== 'chromium', 'Trusted swipe input uses Chromium CDP')
  await load({ text: '', markdown: true })
  await input.tap()
  await page.keyboard.insertText(':scroll_')
  const menu = page.getByRole('grid', { name: '入力候補' })
  await expect(menu.getByRole('row')).toHaveCount(20)
  const scrollArea = menu.getByRole('row').first().locator('..')
  const bounds = await scrollArea.boundingBox()
  if (!bounds) throw new Error('Missing suggestion scroll area')
  const session = await page.context().newCDPSession(page)

  try {
    for (let i = 0; i < 2; i++) {
      const previousTop = await scrollArea.evaluate(
        element => element.scrollTop
      )
      const start = {
        x: bounds.x + bounds.width / 2,
        y: bounds.y + bounds.height * 0.75
      }
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [start]
      })
      for (let step = 1; step <= 10; step++) {
        await session.send('Input.dispatchTouchEvent', {
          type: 'touchMove',
          touchPoints: [{ x: start.x, y: start.y - step * 10 }]
        })
        await page.evaluate(
          () => new Promise(resolve => requestAnimationFrame(resolve))
        )
      }
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchEnd',
        touchPoints: []
      })
      await expect
        .poll(() => scrollArea.evaluate(element => element.scrollTop))
        .toBeGreaterThan(previousTop)
      await expect(page.getByTestId('source')).toHaveText(':scroll_')
    }
    await expect(menu.locator('[aria-selected="true"]')).not.toBeInViewport()
    await expect.poll(() => caret(input)).toMatchObject({ focused: true })

    await page.keyboard.insertText('x')
    await expect(page.getByTestId('source')).toHaveText(':scroll_x')
    await expect(input).toBeFocused()
    await expect(page.getByTestId('posts')).toHaveText('0')
  } finally {
    await session.detach()
  }
})
