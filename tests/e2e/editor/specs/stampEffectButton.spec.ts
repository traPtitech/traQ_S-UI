import { expect, test } from '../support'

test.use({ hasTouch: true })

for (const markdown of [false, true]) {
  for (const [prefix, completed, word] of [
    [':scroll_00', ':scroll_00', ':scroll_00'],
    [':@al', ':@alice', '@alice']
  ] as const) {
    test(
      `chains effects by tapping for ${prefix} with Markdown ${markdown}`,
      { tag: ['@mobile'] },
      async ({ page, input, load, isMobile }, testInfo) => {
        if (!isMobile) await page.setViewportSize({ width: 390, height: 720 })
        await page.addStyleTag({
          content: '[data-testid="input-frame"] { margin-top: 240px; }'
        })
        await load({ text: '', markdown })
        await input.focus()
        await page.keyboard.insertText(prefix)
        const menu = page.getByRole('grid', { name: '入力候補' })

        await menu
          .getByRole('button', {
            name: `${word} にエフェクトを追加`,
            exact: true
          })
          .tap()
        await expect(page.getByTestId('source')).toHaveText(completed + '.')
        await expect(
          menu.getByRole('button', {
            name: '.large にエフェクトを追加',
            exact: true
          })
        ).toBeVisible()
        await menu.screenshot({
          path: testInfo.outputPath('effect-buttons.png'),
          animations: 'disabled'
        })

        await menu
          .getByRole('button', {
            name: '.rotate にエフェクトを追加',
            exact: true
          })
          .tap()
        await expect(page.getByTestId('source')).toHaveText(
          completed + '.rotate.'
        )
        await menu.getByRole('gridcell', { name: '.large', exact: true }).tap()
        await expect(page.getByTestId('source')).toHaveJSProperty(
          'textContent',
          completed + '.rotate.large: '
        )
        await expect(menu).toHaveCount(0)
        await expect(input).toBeFocused()
        await expect(page.getByTestId('posts')).toHaveText('0')
        if (markdown)
          await expect(input.locator('.message-emoji')).toBeVisible()
      }
    )
  }
}
