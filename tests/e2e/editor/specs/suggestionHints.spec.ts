import { test as base, expect } from '../support'

const test = base.extend({
  context: async ({ context, hasTouch }, use) => {
    await context.addInitScript(touch => {
      Object.defineProperty(navigator, 'maxTouchPoints', {
        value: touch ? 1 : 0
      })
    }, hasTouch)
    await use(context)
  }
})

for (const hasTouch of [false, true]) {
  test.describe(`touch input ${hasTouch}`, () => {
    test.use({ hasTouch })

    test('detects Backspace before opening suggestions on a non-touch device', async ({
      page,
      input,
      load
    }) => {
      await load({ text: '', markdown: false })
      await input.focus()
      await page.keyboard.insertText('xx')

      const menu = page.getByRole('grid', { name: '入力候補' })
      const hints = menu.getByRole('group', { name: '補完のキーボード操作' })
      await expect(menu).toHaveCount(0)

      await input.press('Backspace')
      await expect(page.getByTestId('source')).toHaveText('x')
      await page.keyboard.insertText(' @a')
      await expect(menu).toBeVisible()

      if (hasTouch) await expect(hints).toHaveCount(0)
      else await expect(hints).toBeVisible()
    })

    test('remembers keyboard use after the input loses focus', async ({
      page,
      input,
      load
    }) => {
      const menu = page.getByRole('grid', { name: '入力候補' })
      const hints = menu.getByRole('group', { name: '補完のキーボード操作' })
      await load({ text: '', markdown: false })
      await input.focus()
      await page.keyboard.insertText('@a')

      await expect(menu).toBeVisible()
      await expect(hints).toHaveCount(0)
      await input.press('l')
      await expect(page.getByTestId('source')).toHaveText('@al')

      if (hasTouch) {
        await expect(hints).toHaveCount(0)
        await input.press('Shift')
      }

      await expect(hints).toBeVisible()
      await expect(hints.getByText('Tab', { exact: true })).toBeVisible()

      await page.getByTestId('outside').click()
      await expect(menu).toHaveCount(0)
      await load({ text: '', markdown: false })
      await input.focus()
      await page.keyboard.insertText('@a')

      await expect(menu).toBeVisible()
      await expect(hints).toBeVisible()
    })

    test('uses keyboard activity outside the editor until it expires or touch resumes', async ({
      page,
      input,
      load
    }) => {
      await load({ text: '', markdown: false })
      const outside = page.getByTestId('outside')
      await outside.press('Shift')

      const menu = page.getByRole('grid', { name: '入力候補' })
      const hints = menu.getByRole('group', { name: '補完のキーボード操作' })
      const openSearchSuggestions = async () => {
        await load({ text: '', markdown: false, mode: 'search' })
        await input.focus()
        await page.keyboard.insertText('from:a')
        await expect(menu).toBeVisible()
      }

      await openSearchSuggestions()
      await expect(hints).toBeVisible()

      if (hasTouch) {
        await outside.focus()
        await expect(menu).toHaveCount(0)
        await outside.tap()
        await openSearchSuggestions()
      } else {
        await page.clock.fastForward(16_000)
      }

      await expect(hints).toHaveCount(0)
    })
  })
}
