import { type EditorElement, caret, expect, test } from '../support'

test('repositions an open completion menu on scroll without changing its selection', async ({
  page,
  input,
  load
}) => {
  await load({ text: '', markdown: false })
  await page.evaluate(() => {
    document.body.style.minHeight = '2000px'
  })
  await page.getByTestId('input-frame').evaluate(element => {
    element.style.marginTop = '300px'
  })
  await input.focus()
  await page.keyboard.insertText('@al')
  await input.press('Tab')
  const menu = page.getByRole('grid', { name: '入力候補' })
  await expect(menu).toBeVisible()
  const selected = await menu
    .locator('[aria-selected="true"]')
    .getAttribute('id')
  const top = (await menu.boundingBox())?.y
  if (top === undefined) throw new Error('Completion menu has no bounds')

  await page.evaluate(() => window.scrollTo(0, 100))
  await expect
    .poll(async () => Math.round((await menu.boundingBox())?.y ?? NaN))
    .toBe(Math.round(top - 100))
  await expect(menu.locator('[aria-selected="true"]')).toHaveAttribute(
    'id',
    selected ?? ''
  )
  await expect(page.getByTestId('source')).toHaveText('@alice')
})

test('keeps literal math boundaries editable alongside rendered text', async ({
  page,
  input,
  load,
  selectDocumentOffsets,
  modifier
}) => {
  const text = '**before** $x^2$ **after**'
  const boundary = text.indexOf('$x^2$') + '$x^2$'.length
  await load({ text, markdown: true })
  await expect(input.locator('.markdown-input-source')).toHaveText('$x^2$')
  await selectDocumentOffsets(boundary)
  await input.press('ArrowLeft')
  await page.keyboard.insertText('+y')
  await expect(page.getByTestId('source')).toHaveText(
    '**before** $x^2+y$ **after**'
  )
  await input.press(`${modifier}+z`)
  await expect(page.getByTestId('source')).toHaveText(text)
  await expect
    .poll(() => caret(input))
    .toMatchObject({ head: boundary - 1, focused: true })
})

for (const direction of ['caret', 'forward', 'backward'] as const) {
  test(`restores the ${direction} DOM selection when typing before selectionchange`, async ({
    page,
    input,
    load,
    selectDocumentOffsets,
    modifier
  }) => {
    const text = '**before** $x^2$ **after**'
    const start = text.indexOf('x^2')
    const end = start + 'x^2'.length
    const boundary = end + 1
    const anchor = direction === 'forward' ? start : end
    const head = direction === 'backward' ? start : end
    await load({ text, markdown: true })
    await selectDocumentOffsets(boundary)

    const before = await input.evaluate(
      (element: EditorElement, { anchor, head }) => {
        const { view } = element.editor
        const from = view.domAtPos(anchor + 1)
        const to = view.domAtPos(head + 1)
        const native = getSelection()
        if (!native) throw new Error('Missing editor selection')
        native.setBaseAndExtent(from.node, from.offset, to.node, to.offset)
        const range = native.getRangeAt(0)
        const selection = {
          anchor: view.state.selection.anchor - 1,
          head: view.state.selection.head - 1
        }

        // 同じタスク内に入力を届け、selectionchange がまだ通知されていない順序を再現する。
        const event = new InputEvent('beforeinput', {
          bubbles: true,
          cancelable: true,
          inputType: 'insertText',
          data: '+y',
          targetRanges: [
            new StaticRange({
              startContainer: range.startContainer,
              startOffset: range.startOffset,
              endContainer: range.endContainer,
              endOffset: range.endOffset
            })
          ]
        })
        element.dispatchEvent(event)
        return { selection, prevented: event.defaultPrevented }
      },
      { anchor, head }
    )

    expect(before).toEqual({
      selection: { anchor: boundary, head: boundary },
      prevented: true
    })
    const edited =
      text.slice(0, Math.min(anchor, head)) +
      '+y' +
      text.slice(Math.max(anchor, head))
    await expect(page.getByTestId('source')).toHaveText(edited)

    await input.press(`${modifier}+z`)
    await expect(page.getByTestId('source')).toHaveText(text)
    await expect
      .poll(() => caret(input))
      .toMatchObject({ anchor, head, focused: true })

    await input.press(`${modifier}+Shift+z`)
    await expect(page.getByTestId('source')).toHaveText(edited)
    const restored = Math.min(anchor, head) + '+y'.length
    await expect
      .poll(() => caret(input))
      .toMatchObject({ anchor: restored, head: restored, focused: true })
  })
}

test('keeps the composer focused through posting and allows moving focus away', async ({
  input,
  load,
  page
}) => {
  await load({ text: 'sending', markdown: false })
  await input.focus()
  await load({ text: 'sending', markdown: false, readonly: true })

  await expect(input).toBeFocused()
  await expect(input).toHaveAttribute('aria-readonly', 'true')

  await load({ text: '', markdown: false })
  await expect(input).toBeFocused()
  await page.keyboard.type('next message')
  await expect(page.getByTestId('source')).toHaveText('next message')

  await load({ text: 'next message', markdown: false, readonly: true })
  const outside = page.getByTestId('outside')
  await outside.focus()
  await load({ text: '', markdown: false })
  await expect(outside).toBeFocused()
})

test('keeps stamp suggestions clear of the caret after previewing a candidate', async ({
  page,
  input,
  load
}) => {
  await page.setViewportSize({ width: 900, height: 720 })
  await load({ text: '', markdown: true })
  await page.getByTestId('input-frame').evaluate(element => {
    Object.assign(element.style, {
      position: 'fixed',
      inset: 'auto 100px 60px'
    })
  })

  await input.focus()
  await page.keyboard.insertText(':ok')

  const menu = page.getByRole('grid', { name: '入力候補' })
  await expect(
    menu.getByRole('row').filter({ hasText: 'ok_hand' })
  ).toBeVisible()
  await input.press('Tab')
  await expect(page.getByTestId('source')).toHaveText(':ok_hand')
  await expect(input.locator('.message-emoji')).toHaveCount(0)
  await expect(menu).toBeVisible()

  await expect
    .poll(() =>
      input.evaluate((element: EditorElement) => {
        const { state, view } = element.editor
        const caretTop = view.coordsAtPos(state.selection.head, -1).top
        const popup = document.querySelector(
          '[role="grid"][aria-label="入力候補"]'
        )
        return popup ? caretTop - popup.getBoundingClientRect().bottom : null
      })
    )
    .toBeGreaterThanOrEqual(4)
})

for (const markdown of [false, true]) {
  test.describe(`Markdown ${markdown}`, () => {
    test('shows a placeholder only for an empty document, including undo/redo', async ({
      page,
      input,
      load,
      selectDocumentOffsets,
      modifier
    }) => {
      await load({ text: '', markdown })
      await expect(input).toHaveAttribute('data-is-empty', 'true')

      for (const text of ['text\n', '\n', ' ', '**bold**\n']) {
        await load({ text, markdown })

        await expect(page.getByTestId('source')).toHaveJSProperty(
          'textContent',
          text
        )
        await expect(input).toHaveAttribute('data-is-empty', 'false')
        await expect
          .poll(() =>
            input.evaluate(
              element => getComputedStyle(element, '::before').content
            )
          )
          .toBe('none')
      }

      await load({ text: 'typed', markdown })
      await selectDocumentOffsets(5)
      await input.press('Enter')

      await expect(page.getByTestId('source')).toHaveJSProperty(
        'textContent',
        'typed\n'
      )
      await expect(input).toHaveAttribute('data-is-empty', 'false')

      await load({ text: '**bold**\n', markdown })
      await input.focus()
      await input.press(`${modifier}+a`)
      await input.press('Backspace')
      await expect(input).toHaveAttribute('data-is-empty', 'true')
      await input.press(`${modifier}+z`)

      await expect(page.getByTestId('source')).toHaveJSProperty(
        'textContent',
        '**bold**\n'
      )
      await expect(input).toHaveAttribute('data-is-empty', 'false')
      await input.press(`${modifier}+Shift+z`)

      await expect(page.getByTestId('source')).toHaveJSProperty(
        'textContent',
        ''
      )
      await expect(input).toHaveAttribute('data-is-empty', 'true')
    })

    test('focuses from all padding edges and the frame while preserving the caret', async ({
      page,
      input,
      load,
      selectDocumentOffsets
    }) => {
      await load({ text: 'alpha beta', markdown })
      await selectDocumentOffsets(5)
      const padding = input.locator('..').locator('..')
      const frame = padding.locator('..')

      for (const side of ['left', 'right', 'top', 'bottom', 'frame'] as const) {
        await page.getByTestId('outside').click()
        const target = side === 'frame' ? frame : padding
        const box = await target.boundingBox()
        if (!box) throw new Error('Missing input frame')

        await target.click({
          position: {
            x:
              side === 'left' || side === 'frame'
                ? 1
                : side === 'right'
                  ? box.width - 2
                  : box.width / 2,
            y:
              side === 'top'
                ? 1
                : side === 'bottom'
                  ? box.height - 2
                  : box.height / 2
          }
        })

        await expect(input).toBeFocused()
        await expect
          .poll(() => caret(input))
          .toMatchObject({ anchor: 5, head: 5, focused: true })
      }

      await input.press('x')

      await expect(page.getByTestId('source')).toHaveJSProperty(
        'textContent',
        'alphax beta'
      )
    })

    test('edits plain source through rendered delimiters and retains focus', async ({
      page,
      input,
      load,
      selectDocumentOffsets
    }) => {
      const text = '**aaa** [bbb](https://example.test) $x^2$'
      await load({ text, markdown })
      await selectDocumentOffsets(7)
      await input.press('ArrowLeft')

      await expect
        .poll(() => caret(input))
        .toMatchObject({ head: 6, focused: true })

      await input.press('Backspace')

      await expect(page.getByTestId('source')).toHaveJSProperty(
        'textContent',
        '**aaa* [bbb](https://example.test) $x^2$'
      )
      await expect(input).toBeFocused()
      await input.press('x')

      await expect(page.getByTestId('source')).toHaveJSProperty(
        'textContent',
        '**aaax* [bbb](https://example.test) $x^2$'
      )
    })

    test('keeps mention IDs while typing and undoing around a token', async ({
      page,
      input,
      load,
      modifier
    }) => {
      const reference =
        '!{"type":"user","id":"11111111-1111-4111-8111-111111111111","raw":"@alice"}'
      await load({ text: reference + ' ', markdown })
      await expect(input.locator('.reference-token')).toHaveText('@alice')
      await input.focus()
      await input.press(`${modifier}+a`)
      await input.press('ArrowRight')

      await expect
        .poll(() =>
          input.evaluate((element: EditorElement) =>
            element.editor.state.selection.toJSON()
          )
        )
        .toMatchObject({ anchor: 3, head: 3 })

      await input.press('x')

      await expect(page.getByTestId('source')).toHaveJSProperty(
        'textContent',
        reference + ' x'
      )

      await input.press(`${modifier}+z`)

      await expect(page.getByTestId('source')).toHaveJSProperty(
        'textContent',
        reference + ' '
      )
      await expect(input.locator('.reference-token')).toHaveText('@alice')
    })
  })
}

test('supports sibling items, continuation lines, child items, and quote exit', async ({
  page,
  input,
  load,
  selectDocumentOffsets
}) => {
  await load({ text: '- aaa', markdown: true })
  await selectDocumentOffsets(5)
  await input.press('Enter')

  await expect(page.getByTestId('source')).toHaveJSProperty(
    'textContent',
    '- aaa\n- '
  )

  await input.press('Tab')
  await input.press('b')

  await expect(page.getByTestId('source')).toHaveJSProperty(
    'textContent',
    '- aaa\n  - b'
  )

  await input.press('Shift+Enter')
  await input.press('c')

  await expect(page.getByTestId('source')).toHaveJSProperty(
    'textContent',
    '- aaa\n  - b\n    c'
  )
  await expect(page.getByTestId('posts')).toHaveText('0')
  await expect(input).toBeFocused()

  await load({ text: '> quote', markdown: true })
  await selectDocumentOffsets(7)
  await input.press('Enter')

  await expect(page.getByTestId('source')).toHaveJSProperty(
    'textContent',
    '> quote\n> '
  )

  await input.press('Enter')

  await expect(page.getByTestId('source')).toHaveJSProperty(
    'textContent',
    '> quote\n\n'
  )
})

test('indents a selection, outdents it, and undoes without losing focus', async ({
  page,
  input,
  load,
  selectDocumentOffsets,
  modifier
}) => {
  await load({ text: 'aaa\nbbb', markdown: true })
  await selectDocumentOffsets(0, 7)
  await input.press('Tab')

  await expect(page.getByTestId('source')).toHaveJSProperty(
    'textContent',
    '  aaa\n  bbb'
  )

  await input.press('Shift+Tab')

  await expect(page.getByTestId('source')).toHaveJSProperty(
    'textContent',
    'aaa\nbbb'
  )

  await input.press(`${modifier}+z`)

  await expect(page.getByTestId('source')).toHaveJSProperty(
    'textContent',
    '  aaa\n  bbb'
  )
  await expect(input).toBeFocused()
})

test('formats table cell contents while leaving syntax and math guides unstyled', async ({
  page,
  input,
  load
}) => {
  const text = '| a | b |\n| --- | --- |\n| **bold** | _italic_ $x^2$ |'
  await load({ text, markdown: true })
  await expect(input.locator('.markdown-input-strong')).toHaveText('bold')
  await expect(input.locator('.markdown-input-emphasis')).toHaveText('italic')

  const styles = await input
    .locator('.markdown-input-syntax')
    .evaluateAll(elements =>
      elements.map(element => {
        const style = getComputedStyle(element)

        return {
          weight: style.fontWeight,
          font: style.fontStyle,
          decoration: style.textDecorationLine
        }
      })
    )

  expect(styles.length).toBeGreaterThan(0)
  expect(
    styles.every(
      style =>
        style.weight === '400' &&
        style.font === 'normal' &&
        style.decoration === 'none'
    )
  ).toBe(true)
  await expect(page.getByTestId('source')).toHaveJSProperty('textContent', text)
})

test('toggles the Markdown flag without changing a draft or selection', async ({
  page,
  input,
  load,
  selectDocumentOffsets
}) => {
  const text = '**bold**'
  await load({ text, markdown: true })
  await selectDocumentOffsets(4)
  await expect(input.locator('.markdown-input-strong')).toHaveText('bold')
  await load({ text, markdown: false })
  await expect(input.locator('.markdown-input-strong')).toHaveCount(0)
  await expect
    .poll(() => caret(input))
    .toMatchObject({ head: 4, focused: true })
  await expect(page.getByTestId('source')).toHaveJSProperty('textContent', text)
})
