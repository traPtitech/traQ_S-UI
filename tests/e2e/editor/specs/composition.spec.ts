import type { EditorElement } from '../support'
import { caret, expect, test } from '../support'

const sample = 'あああああｄｓｓｓｓｓｓっさああ'

for (const context of [
  { mode: 'message', markdown: false },
  { mode: 'message', markdown: true },
  { mode: 'search', markdown: false }
] as const) {
  test.describe(`${context.mode}, Markdown ${context.markdown}`, () => {
    for (const selection of ['backward', 'clause', 'pending-end'] as const) {
      test(`imports IME Backspace with ${selection} selection`, async ({
        page,
        input,
        load,
        selectEditorOffsets
      }) => {
        const prefix = 'before '
        await load({ ...context, text: prefix + sample })

        await selectEditorOffsets(
          prefix.length + (selection === 'clause' ? 5 : sample.length),
          prefix.length + (selection === 'clause' ? 12 : 0)
        )

        const next =
          selection === 'clause' ? sample.slice(1) : sample.slice(0, -1)

        // Model a browser-owned composition edit, including its selected clause.
        // A synthetic key alone cannot exercise ProseMirror's DOM import path.
        await input.evaluate(
          (element: EditorElement, { text, finish }) => {
            element.dispatchEvent(
              new CompositionEvent('compositionstart', { bubbles: true })
            )

            element.dispatchEvent(
              new KeyboardEvent('keydown', {
                key: 'Backspace',
                bubbles: true,
                isComposing: true
              })
            )

            const node = element.querySelector('p')?.firstChild

            if (!(node instanceof Text))
              throw new Error('Missing composition text')

            node.data = text
            getSelection()?.collapse(node, text.length)

            // Some engines deliver compositionend before MutationObserver flushes.
            if (finish)
              element.dispatchEvent(
                new CompositionEvent('compositionend', { bubbles: true })
              )
          },
          { text: prefix + next, finish: selection === 'pending-end' }
        )

        await expect(page.getByTestId('source')).toHaveJSProperty(
          'textContent',
          prefix + next
        )
        await expect
          .poll(() => caret(input))
          .toEqual({
            anchor: prefix.length + next.length,
            head: prefix.length + next.length,
            composing: selection !== 'pending-end',
            focused: true
          })
        await expect(page.getByTestId('posts')).toHaveText('0')

        if (selection !== 'pending-end') {
          await input.dispatchEvent('compositionend')

          await expect
            .poll(async () => (await caret(input)).composing)
            .toBe(false)
        }

        await input.press('Backspace')

        await expect(page.getByTestId('source')).toHaveJSProperty(
          'textContent',
          prefix + next.slice(0, -1)
        )
        await expect(input).toBeFocused()
      })
    }
  })
}

test('keeps surrounding Markdown stable while composing and cancelling', async ({
  page,
  input,
  load,
  selectEditorOffsets
}) => {
  const source = '**bold** before '
  await load({ text: source, markdown: true })
  await selectEditorOffsets(source.length)

  await input.dispatchEvent('compositionstart')

  await input.evaluate((element: EditorElement, text) => {
    const node = element.querySelector('p')?.lastChild
    if (!(node instanceof Text)) throw new Error('Missing composition text')

    node.appendData(text)
    getSelection()?.collapse(node, node.length)
  }, sample)

  await expect(page.getByTestId('source')).toHaveJSProperty(
    'textContent',
    source + sample
  )
  await expect(input.locator('.markdown-input-strong')).toHaveText('bold')
  await expect
    .poll(() => caret(input))
    .toMatchObject({
      head: source.length + sample.length,
      composing: true,
      focused: true
    })

  await input.evaluate((element: EditorElement, length) => {
    const node = element.querySelector('p')?.lastChild
    if (!(node instanceof Text)) throw new Error('Missing composition text')

    node.deleteData(node.length - length, length)
    getSelection()?.collapse(node, node.length)

    element.dispatchEvent(
      new CompositionEvent('compositionend', { bubbles: true })
    )
  }, sample.length)

  await expect(page.getByTestId('source')).toHaveJSProperty(
    'textContent',
    source
  )
  await expect
    .poll(() => caret(input))
    .toEqual({
      anchor: source.length,
      head: source.length,
      composing: false,
      focused: true
    })

  await input.press('x')

  await expect(page.getByTestId('source')).toHaveJSProperty(
    'textContent',
    source + 'x'
  )
})

test.describe('Chromium CDP composition', () => {
  test.skip(
    ({ browserName }) => browserName !== 'chromium',
    'Input.imeSetComposition is a Chromium CDP API'
  )

  for (const markdown of [false, true]) {
    for (const selection of ['collapsed', 'whole', 'clause'] as const) {
      test(`Chromium CDP composition: Markdown ${markdown}, ${selection}`, async ({
        page,
        input,
        load,
        selectEditorOffsets
      }) => {
        const prefix = 'before '
        await load({ text: prefix, markdown })
        await selectEditorOffsets(prefix.length)
        const session = await page.context().newCDPSession(page)

        await input.evaluate(element => {
          element.dataset['compositionEnds'] = '0'
          element.dataset['trusted'] = 'true'

          element.addEventListener('compositionend', () => {
            element.dataset['compositionEnds'] = String(
              Number(element.dataset['compositionEnds']) + 1
            )
          })

          element.addEventListener('compositionupdate', event => {
            if (!event.isTrusted) element.dataset['trusted'] = 'false'
          })
        })

        let text = sample

        for (let removed = 0; removed < 4; removed++) {
          text =
            selection === 'clause'
              ? sample.slice(removed)
              : sample.slice(0, sample.length - removed)

          const anchor =
            selection === 'whole'
              ? 0
              : selection === 'clause'
                ? 5 - removed
                : text.length

          const head = selection === 'clause' ? 12 - removed : text.length

          await session.send('Input.imeSetComposition', {
            text,
            selectionStart: anchor,
            selectionEnd: head
          })

          await expect(page.getByTestId('source')).toHaveJSProperty(
            'textContent',
            prefix + text
          )
          await expect
            .poll(() => caret(input))
            .toEqual({
              anchor: prefix.length + anchor,
              head: prefix.length + head,
              composing: true,
              focused: true
            })
          await expect(input).toHaveAttribute('data-composition-ends', '0')
        }

        await session.send('Input.insertText', { text })

        await expect(page.getByTestId('source')).toHaveJSProperty(
          'textContent',
          prefix + text
        )
        await expect
          .poll(() => caret(input))
          .toEqual({
            anchor: prefix.length + text.length,
            head: prefix.length + text.length,
            composing: false,
            focused: true
          })
        await expect(input).toHaveAttribute('data-trusted', 'true')
        await expect(input).toHaveAttribute('data-composition-ends', '1')
        await input.press('Backspace')

        await expect(page.getByTestId('source')).toHaveJSProperty(
          'textContent',
          prefix + text.slice(0, -1)
        )
        await expect(page.getByTestId('posts')).toHaveText('0')
        await session.detach()
      })
    }
  }
})
