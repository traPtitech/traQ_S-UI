import {
  type CDPSession,
  type Locator,
  test as base,
  expect
} from '@playwright/test'
import type { Editor } from '@tiptap/core'

import type { EditorDraft } from './harness'

export type EditorElement = HTMLElement & { editor: Editor }

export const test = base.extend<{
  cdp: CDPSession
  input: Locator
  load: (draft: EditorDraft) => Promise<void>
  /** Paragraph offsets; each reference atom occupies one position. */
  selectEditorOffsets: (anchor: number, head?: number) => Promise<void>
  modifier: 'Meta' | 'Control'
}>({
  page: [
    async ({ page }, use) => {
      const errors: string[] = []
      page.on('pageerror', error => errors.push(error.message))

      // IME の経過時間を止めずに、機能フラグの期限を固定する。
      await page.clock.setSystemTime(new Date('2026-11-03T00:00:00Z'))

      await page.route('**/api/v3/**', async route => {
        const path = new URL(route.request().url()).pathname

        if (path === '/api/v3/meta') {
          await route.fulfill({
            json: { canonicalOrigin: 'http://127.0.0.1:4174' }
          })
        } else if (
          path === '/api/v3/users' ||
          path === '/api/v3/groups' ||
          path === '/api/v3/activity/onlines'
        ) {
          await route.fulfill({ json: [] })
        } else if (path === '/api/v3/files/icon') {
          await route.fulfill({
            contentType: 'image/svg+xml',
            body: '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>'
          })
        } else {
          errors.push(
            `Unexpected API request: ${route.request().method()} ${path}`
          )

          await route.abort()
        }
      })

      await page.goto('./')
      await page.waitForFunction(() => !!window.editorHarness)
      await page.evaluate(() => window.editorHarness.ready)
      await use(page)

      expect(errors).toEqual([])
    },
    { scope: 'test', timeout: 60_000 }
  ],

  cdp: async ({ page }, use) => {
    const session = await page.context().newCDPSession(page)

    try {
      await use(session)
    } finally {
      await session.detach()
    }
  },

  input: async ({ page }, use) => {
    const frame = page.getByTestId('input-frame')
    await use(frame.getByRole('textbox').or(frame.getByRole('combobox')))
  },

  load: async ({ page, input }, use) => {
    await use(async draft => {
      await page.evaluate(draft => window.editorHarness.load(draft), draft)
      await expect(input).toBeVisible()
      await expect(page.getByTestId('source')).toHaveJSProperty(
        'textContent',
        draft.text
      )
    })
  },

  selectEditorOffsets: async ({ input }, use) => {
    await use(async (anchor, head = anchor) => {
      await input.focus()

      await input.evaluate(
        (element: EditorElement, { anchor, head }) => {
          const { view } = element.editor
          const from = view.domAtPos(anchor + 1)
          const to = view.domAtPos(head + 1)

          getSelection()?.setBaseAndExtent(
            from.node,
            from.offset,
            to.node,
            to.offset
          )

          // 遅延したフォーカス復元より先に選択範囲を通知する。
          element.ownerDocument.dispatchEvent(new Event('selectionchange'))
        },
        { anchor, head }
      )

      await expect
        .poll(() =>
          input.evaluate((element: EditorElement) => ({
            anchor: element.editor.state.selection.anchor - 1,
            head: element.editor.state.selection.head - 1
          }))
        )
        .toEqual({ anchor, head })
    })
  },

  modifier: async ({ page }, use) => {
    await use(
      await page.evaluate(() =>
        navigator.platform.includes('Mac') ? 'Meta' : 'Control'
      )
    )
  }
})

export { expect }

export const caret = (input: Locator) =>
  input.evaluate((element: EditorElement) => {
    const selection = getSelection()
    const { view } = element.editor

    return {
      anchor: selection?.anchorNode
        ? view.posAtDOM(selection.anchorNode, selection.anchorOffset) - 1
        : null,
      head: selection?.focusNode
        ? view.posAtDOM(selection.focusNode, selection.focusOffset) - 1
        : null,
      composing: view.composing,
      focused: document.activeElement === element
    }
  })
