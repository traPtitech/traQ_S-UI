import { type EditorElement, expect, test } from '../support'

test(
  'preserves references through real clipboard copy, cut, paste and Undo',
  { tag: '@chromium' },
  async ({ page, input, load, modifier, browserName }) => {
    test.skip(
      browserName !== 'chromium',
      'clipboard permissions are exercised in Chromium'
    )

    await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
    const reference =
      '!{"type":"user","id":"11111111-1111-4111-8111-111111111111","raw":"@alice"}'
    await load({ text: reference, markdown: true })
    await input.focus()
    await input.press(`${modifier}+a`)
    await input.press(`${modifier}+c`)

    await expect
      .poll(() => page.evaluate(() => navigator.clipboard.readText()))
      .toBe('@alice')

    await input.press(`${modifier}+x`)
    await expect(page.getByTestId('source')).toHaveText('')
    await input.press(`${modifier}+v`)
    await expect(page.getByTestId('source')).toHaveText(reference)
    await expect(input.locator('.reference-token')).toHaveText('@alice')
    await input.press(`${modifier}+z`)
    await expect(page.getByTestId('source')).toHaveText('')
  }
)

for (const operation of ['copy', 'cut', 'paste', 'paste HTML'] as const) {
  test(`uses the current DOM selection for ${operation} before selectionchange`, async ({
    input,
    load,
    page,
    selectEditorOffsets
  }) => {
    await load({ text: 'abcde', markdown: false })
    await selectEditorOffsets(0, 1)
    page.on('dialog', dialog => dialog.accept())

    const copied = await input.evaluate((element: EditorElement, operation) => {
      const { view } = element.editor
      const from = view.domAtPos(3)
      const to = view.domAtPos(5)
      getSelection()?.setBaseAndExtent(
        from.node,
        from.offset,
        to.node,
        to.offset
      )

      const event = new ClipboardEvent(
        operation === 'paste HTML' ? 'paste' : operation,
        {
          clipboardData: new DataTransfer(),
          bubbles: true,
          cancelable: true
        }
      )
      // Firefox はコンストラクターへ渡した DataTransfer を使わない。
      const data = event.clipboardData
      if (!data) throw new Error('Missing clipboard data')
      if (operation.startsWith('paste')) data.setData('text/plain', 'X')
      if (operation === 'paste HTML')
        data.setData('text/html', '<strong>X</strong>')

      element.dispatchEvent(event)

      if (operation === 'paste HTML') {
        const start = view.domAtPos(1)
        getSelection()?.collapse(start.node, start.offset)
      }

      return data.getData('text/plain')
    }, operation)

    if (operation === 'copy' || operation === 'cut') expect(copied).toBe('cd')

    const expected = {
      copy: 'abcde',
      cut: 'abe',
      paste: 'abXe',
      'paste HTML': 'ab**X**e'
    }
    await expect(page.getByTestId('source')).toHaveText(expected[operation])
  })
}

test('inserts dropped text at its coordinates while the caret is elsewhere', async ({
  page,
  input,
  load,
  selectEditorOffsets
}) => {
  await load({ text: 'before after', markdown: false })
  await selectEditorOffsets(12)

  const drop = await input.evaluate(element => {
    const text = element.querySelector('p')?.firstChild
    if (!(text instanceof Text)) throw new Error('Missing editor text')
    const range = document.createRange()
    range.setStart(text, 7)
    range.setEnd(text, 7)
    const rect = range.getBoundingClientRect()
    return { x: rect.left, y: (rect.top + rect.bottom) / 2 }
  })

  await input.evaluate((element, drop) => {
    const dataTransfer = new DataTransfer()
    dataTransfer.setData('text/plain', 'dropped ')

    element.dispatchEvent(
      new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        clientX: drop.x,
        clientY: drop.y,
        dataTransfer
      })
    )
  }, drop)

  await expect(page.getByTestId('source')).toHaveText('before dropped after')
})
