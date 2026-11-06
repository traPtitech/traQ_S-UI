import { type Locator, devices } from '@playwright/test'

import { test as base, expect } from '../support'

const test = base.extend({
  context: async ({ context }, use) => {
    // iPadOS can use a desktop UA; ProseMirror also checks the touch point count.
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'maxTouchPoints', { get: () => 5 })
    })
    await use(context)
  }
})

const softwareEnter = (
  input: Locator,
  inputType: 'insertParagraph' | 'insertLineBreak' = 'insertParagraph'
) =>
  input.evaluate((element, inputType) => {
    const keydown = new KeyboardEvent('keydown', {
      key: 'Enter',
      keyCode: 13,
      shiftKey: inputType === 'insertLineBreak',
      bubbles: true,
      cancelable: true
    })
    element.dispatchEvent(keydown)

    // iOS must allow the keydown default action to reach beforeinput.
    if (keydown.defaultPrevented) throw new Error('iOS keydown was cancelled')

    element.dispatchEvent(
      new InputEvent('beforeinput', {
        inputType,
        bubbles: true,
        cancelable: true
      })
    )
    element.dispatchEvent(
      new KeyboardEvent('keyup', { key: 'Enter', bubbles: true })
    )
  }, inputType)

for (const device of ['iPad Pro 11', 'Desktop Safari']) {
  const descriptor = devices[device]
  if (!descriptor) throw new Error(`Unknown device: ${device}`)

  test.describe(`iPad keyboard with ${device} UA`, () => {
    test.use({ userAgent: descriptor.userAgent, hasTouch: true })

    test.beforeEach(({ browserName }) => {
      test.skip(
        browserName !== 'webkit',
        'Exercises the iPad WebKit input path'
      )
    })

    for (const markdown of [false, true]) {
      for (const software of [false, true]) {
        test(`inserts one newline per Enter with Markdown ${markdown}, software events ${software}`, async ({
          page,
          input,
          load,
          selectEditorOffsets
        }) => {
          await page.clock.install()
          await load({ text: 'hello', markdown })
          await selectEditorOffsets(5)

          for (let count = 1; count <= 2; count++) {
            if (software) await softwareEnter(input)
            else await input.press('Enter')

            // Also run ProseMirror's delayed iOS Enter fallback.
            await page.clock.runFor(250)
            await expect(page.getByTestId('source')).toHaveJSProperty(
              'textContent',
              'hello' + '\n'.repeat(count)
            )
            await expect(page.getByTestId('posts')).toHaveText('0')
            await expect(input).toBeFocused()
          }
        })
      }
    }

    for (const [inputType, expected] of [
      ['insertParagraph', '- item\n- '],
      ['insertLineBreak', '- item\n  ']
    ] as const) {
      test(`keeps Markdown list continuation for ${inputType}`, async ({
        page,
        input,
        load,
        selectEditorOffsets
      }) => {
        await page.clock.install()
        await load({ text: '- item', markdown: true })
        await selectEditorOffsets(6)

        await softwareEnter(input, inputType)
        await page.clock.runFor(250)

        await expect(page.getByTestId('source')).toHaveJSProperty(
          'textContent',
          expected
        )
        await expect(page.getByTestId('posts')).toHaveText('0')
      })
    }

    test('confirms a stamp without inserting a delayed newline', async ({
      page,
      input,
      load
    }) => {
      await page.clock.install()
      await load({ text: '', markdown: true })
      await input.pressSequentially(':ok')
      const menu = page.getByRole('grid', { name: '入力候補' })
      await expect(menu).toBeVisible()

      await softwareEnter(input)
      await page.clock.runFor(250)
      await expect(page.getByTestId('source')).toHaveJSProperty(
        'textContent',
        ':ok_hand: '
      )
      await expect(menu).toHaveCount(0)

      await softwareEnter(input)
      await page.clock.runFor(250)
      await expect(page.getByTestId('source')).toHaveJSProperty(
        'textContent',
        ':ok_hand: \n'
      )
      await expect(page.getByTestId('posts')).toHaveText('0')
    })
  })
}
