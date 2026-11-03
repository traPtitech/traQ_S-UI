import { type EditorElement, caret, expect, test } from '../support'

for (const width of [900, 390]) {
  test(`inserts a stamp without refocusing the composer at ${width}px`, async ({
    page,
    input,
    load,
    selectDocumentOffsets
  }) => {
    await page.setViewportSize({ width, height: 720 })
    await load({ text: 'abcde', markdown: true })
    await selectDocumentOffsets(1, 3)
    await page.getByRole('button', { name: 'スタンプを挿入' }).click()

    const search = page.getByPlaceholder('スタンプを検索')
    const source = page.getByTestId('source')
    await search.fill('ok_hand')

    if (width === 900) await search.press('Enter')
    else
      await page.getByRole('button', { name: 'ok_hand', exact: true }).click()

    await expect(source).toHaveText('a:ok_hand:de')
    await page.evaluate(
      () => new Promise(resolve => requestAnimationFrame(resolve))
    )
    await expect(input).not.toBeFocused()
    await expect(search).toBeVisible()

    if (width === 900) {
      await expect(search).toBeFocused()
      await page.keyboard.press('Enter')
      await expect(source).toHaveText('a:ok_hand::ok_hand:de')
    }
  })
}

const stamp = ':ok_hand:'

test('keeps wheel scrolling through stamp suggestions until keyboard navigation resumes', async ({
  page,
  input,
  load
}) => {
  await page.addStyleTag({
    content: '[data-testid="input-frame"] { margin-top: 240px; }'
  })
  await load({ text: '', markdown: true })
  await input.focus()
  await page.keyboard.insertText(':scroll_')

  const menu = page.getByRole('grid', { name: '入力候補' })
  await expect(menu.getByRole('row')).toHaveCount(20)
  const scrollArea = menu.getByRole('row').first().locator('..')
  await scrollArea.hover()
  await page.mouse.wheel(0, 400)
  await page.evaluate(
    () =>
      new Promise(resolve =>
        requestAnimationFrame(() => requestAnimationFrame(resolve))
      )
  )
  await expect
    .poll(() => scrollArea.evaluate(element => element.scrollTop))
    .toBeGreaterThan(200)

  await input.press('ArrowDown')
  await expect(menu.locator('[aria-selected="true"]')).toBeInViewport({
    ratio: 1
  })
  await expect
    .poll(() => scrollArea.evaluate(element => element.scrollTop))
    .toBeLessThan(100)
  await expect(input).toBeFocused()
})

test('deletes the stamp closing colon with one Backspace and restores it with Undo', async ({
  page,
  input,
  load,
  modifier
}) => {
  await load({ text: stamp, markdown: true })
  await input.press('End')
  const source = page.getByTestId('source')
  const preview = input.locator('.message-emoji')
  await expect(preview).toBeVisible()

  await input.press('Backspace')
  await expect(source).toHaveText(':ok_hand')
  await expect(preview).toHaveCount(0)
  await expect
    .poll(() => caret(input))
    .toMatchObject({
      head: stamp.length - 1,
      focused: true
    })

  await input.press(`${modifier}+z`)
  await expect(source).toHaveText(stamp)
  await expect(preview).toBeVisible()
  await expect.poll(() => caret(input)).toMatchObject({ head: stamp.length })

  await input.press(`${modifier}+Shift+z`)
  await expect(source).toHaveText(':ok_hand')
  await expect(preview).toHaveCount(0)
  await expect
    .poll(() => caret(input))
    .toMatchObject({ head: stamp.length - 1 })
})

for (const markdown of [false, true]) {
  test(`requires a new opening colon after a stamp with Markdown ${markdown}`, async ({
    page,
    input,
    load
  }) => {
    await load({ text: '', markdown })
    await input.focus()
    await page.keyboard.insertText(stamp)
    await page.keyboard.insertText('o')

    const source = page.getByTestId('source')
    const menu = page.getByRole('grid', { name: '入力候補' })
    await expect(source).toHaveText(stamp + 'o')
    await expect(menu).toHaveCount(0)

    await page.keyboard.insertText(':ok')
    await expect(
      menu.getByRole('gridcell').filter({ hasText: 'ok_hand' })
    ).toBeVisible()
    await input.press('Enter')

    await expect(source).toHaveJSProperty(
      'textContent',
      stamp + 'o' + stamp + ' '
    )
  })
}

for (const confirmation of ['Enter', 'Tab', 'click']) {
  test(`renders a stamp confirmed from suggestions with ${confirmation}`, async ({
    page,
    input,
    load
  }) => {
    await page.setViewportSize({ width: 900, height: 720 })
    await load({ text: '', markdown: true })
    await input.focus()
    await page.keyboard.insertText(':ok')

    const menu = page.getByRole('grid', { name: '入力候補' })
    const candidate = menu.getByRole('gridcell').filter({ hasText: 'ok_hand' })
    await expect(candidate).toBeVisible()

    if (confirmation === 'click') await candidate.click()
    else {
      if (confirmation === 'Tab') await input.press('Tab')
      await input.press(confirmation)
    }

    await expect(menu).toHaveCount(0)
    await expect(page.getByTestId('source')).toHaveJSProperty(
      'textContent',
      stamp + ' '
    )
    await expect(input.locator('.message-emoji')).toBeVisible()
  })
}

for (const confirmation of ['Enter', 'Tab', 'click']) {
  test(`renders a stamp completed with ${confirmation} after deleting its end`, async ({
    page,
    input,
    load
  }) => {
    await page.setViewportSize({ width: 900, height: 720 })
    await load({ text: stamp, markdown: true })

    const source = page.getByTestId('source')
    const preview = input.locator('.message-emoji')
    await expect(preview).toBeVisible()
    await input.press('End')
    await expect.poll(() => caret(input)).toMatchObject({ head: stamp.length })

    await input.press('Backspace')
    await expect(source).toHaveText(':ok_hand')
    await expect(preview).toHaveCount(0)
    await input.press('Backspace')
    await expect(source).toHaveText(':ok_han')

    const menu = page.getByRole('grid', { name: '入力候補' })
    const candidate = menu.getByRole('gridcell').filter({ hasText: 'ok_hand' })
    await expect(candidate).toBeVisible()

    if (confirmation === 'click') await candidate.click()
    else {
      if (confirmation === 'Tab') await input.press('Tab')
      await input.press(confirmation)
    }

    await expect(menu).toHaveCount(0)
    await expect(source).toHaveJSProperty('textContent', stamp + ' ')
    await expect(preview).toBeVisible()
    await expect(input).toBeFocused()
  })
}

test('renders the stamp in the same update when inserting and restoring its preview', async ({
  page,
  input,
  load
}) => {
  await page.setViewportSize({ width: 900, height: 720 })
  await load({ text: '', markdown: true })

  const snapshots = await input.evaluateHandle((element: EditorElement) => {
    const previews: boolean[] = []
    element.editor.on('transaction', () => {
      const widget = element.querySelector('.markdown-input-rendered')
      if (widget) previews.push(!!widget.querySelector('.message-emoji'))
    })
    return previews
  })

  await page.getByRole('button', { name: 'スタンプを挿入' }).click()
  const search = page.getByPlaceholder('スタンプを検索')
  await search.fill('ok_hand')
  await search.press('Enter')
  const source = page.getByTestId('source')
  await expect(source).toHaveText(stamp)

  await page.getByTestId('outside').click()
  await input.press('End')
  const preview = input.locator('.message-emoji')
  await expect(preview).toBeVisible()
  await input.press('ArrowLeft')
  await expect(preview).toHaveCount(0)
  await page.keyboard.type('x')
  await expect(source).toHaveText(`${stamp}x`)
  await expect(preview).toBeVisible()

  await input.press('ArrowLeft')
  await expect.poll(() => caret(input)).toMatchObject({ head: stamp.length })
  await expect(preview).toBeVisible()
  await input.press('ArrowLeft')
  await expect(preview).toHaveCount(0)

  const frames = await snapshots.jsonValue()
  expect(frames.length).toBeGreaterThan(0)
  expect(frames).not.toContain(false)
})

for (const { target, expected, fraction } of [
  { target: 'the left half of a stamp', expected: `X${stamp}`, fraction: 0.25 },
  {
    target: 'the right half of a stamp',
    expected: `${stamp}X`,
    fraction: 0.75
  },
  {
    target: 'the blank after consecutive stamps',
    expected: `${stamp}${stamp}X`
  }
]) {
  test(`places the caret when clicking ${target}`, async ({
    page,
    input,
    load
  }) => {
    await page.setViewportSize({ width: 900, height: 720 })
    await load({ text: '', markdown: true })
    await page.getByRole('button', { name: 'スタンプを挿入' }).click()

    const search = page.getByPlaceholder('スタンプを検索')
    const source = page.getByTestId('source')
    const blank = fraction === undefined

    await search.fill('ok_hand')
    await search.press('Enter')
    if (blank) await search.press('Enter')
    await expect(source).toHaveText(blank ? stamp.repeat(2) : stamp)

    await page.getByTestId('outside').click()
    await expect(search).not.toBeVisible()

    const widget = input.locator('.markdown-input-rendered').last()
    const icon = widget.locator('.message-emoji')
    await expect(icon).toBeVisible()
    const iconBox = await icon.boundingBox()
    const lineBox = await input.locator('p').boundingBox()
    if (!iconBox || !lineBox) throw new Error('Missing rendered stamp')

    const x = blank
      ? iconBox.x + iconBox.width + 8
      : iconBox.x + iconBox.width * fraction
    const y = blank ? lineBox.y + 1 : iconBox.y + iconBox.height / 2

    await page.mouse.click(x, y)
    await expect(input).toBeFocused()
    await expect(input.locator('.markdown-input-rendered')).toHaveCount(
      blank ? 2 : 0
    )

    await page.keyboard.type('X')
    await expect(source).toHaveText(expected)
  })
}
