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
  await input.pressSequentially('@al')
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

test('keeps the composer focused through posting and allows moving focus away', async ({
  input,
  load,
  page
}) => {
  await load({ text: 'sending', markdown: false })
  await input.focus()
  await page.evaluate(() =>
    window.editorHarness.updateOptions({ readonly: true })
  )

  await expect(input).toBeFocused()
  await expect(input).toHaveAttribute('aria-readonly', 'true')

  await load({ text: '', markdown: false })
  await expect(input).toBeFocused()
  await page.keyboard.type('next message')
  await expect(page.getByTestId('source')).toHaveText('next message')

  await page.evaluate(() =>
    window.editorHarness.updateOptions({ readonly: true })
  )
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
  await input.pressSequentially(':ok')

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
    test('focuses from all padding edges and the frame while preserving the caret', async ({
      page,
      input,
      load,
      selectEditorOffsets
    }) => {
      await load({ text: 'alpha beta', markdown })
      await selectEditorOffsets(5)
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
  selectEditorOffsets
}) => {
  await load({ text: '- aaa', markdown: true })
  await selectEditorOffsets(5)
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
  await selectEditorOffsets(7)
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

test('toggles the Markdown flag without changing a draft or selection', async ({
  page,
  input,
  load,
  selectEditorOffsets
}) => {
  const text = '**bold**'
  await load({ text, markdown: true })
  await selectEditorOffsets(4)
  await expect(input.locator('.markdown-input-strong')).toHaveText('bold')
  await page.evaluate(() =>
    window.editorHarness.updateOptions({ markdown: false })
  )
  await expect(input.locator('.markdown-input-strong')).toHaveCount(0)
  await expect
    .poll(() => caret(input))
    .toMatchObject({ head: 4, focused: true })
  await expect(page.getByTestId('source')).toHaveJSProperty('textContent', text)
})
