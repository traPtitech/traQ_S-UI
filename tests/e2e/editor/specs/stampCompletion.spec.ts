import { expect, test } from '../support'

for (const stamp of [':scroll_00', ':@alice']) {
  test(`keeps ${stamp} previews within five animations while allowing sizes`, async ({
    page,
    input,
    load
  }) => {
    await load({ text: '', markdown: true })
    await input.focus()
    const prefix = stamp + '.atsumori.atsumori.conga.flashy'
    await input.pressSequentially(prefix + '.atsu')

    const menu = page.getByRole('grid', { name: '入力候補' })
    const fifth = menu.getByRole('gridcell', { name: '.atsumori', exact: true })
    await expect(fifth.locator('.message-emoji')).toHaveCount(1)
    await expect(fifth.locator('.emoji-effect')).toHaveCount(5)

    await input.press('.')
    await expect(page.getByTestId('source')).toHaveText(prefix + '.atsumori.')
    await expect(menu.getByRole('row')).toHaveCount(3)
    for (const size of ['.small', '.large', '.ex-large'])
      await expect(
        menu.getByRole('gridcell', { name: size, exact: true })
      ).toBeVisible()

    const small = menu.getByRole('gridcell', { name: '.small', exact: true })
    await expect(small.locator('.message-emoji')).toHaveCount(1)
    await small.click()
    await expect(page.getByTestId('source')).toHaveJSProperty(
      'textContent',
      prefix + '.atsumori.small: '
    )
    await expect(input.locator('.message-emoji')).toBeVisible()
    await expect(menu).toHaveCount(0)
  })

  test(`composes existing effects in ${stamp} previews and follows eco mode`, async ({
    page,
    input,
    load
  }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await load({ text: '', markdown: false })
    await input.focus()
    const text = stamp + '.large.rotate.wiggle.zo'
    await page.keyboard.insertText(text)

    const candidate = page
      .getByRole('grid', { name: '入力候補' })
      .getByRole('gridcell', { name: '.zoom', exact: true })
    await expect(candidate.locator('.message-emoji')).toHaveAttribute(
      'title',
      stamp + ':'
    )
    await expect(candidate.locator('.message-emoji')).toHaveClass(/\blarge\b/)
    await expect(candidate.locator('.rotate .wiggle .zoom')).toHaveCount(1)

    for (const ecoMode of [false, true, false]) {
      await page.evaluate(
        enabled => window.editorHarness.setEcoMode(enabled),
        ecoMode
      )
      for (const effect of ['rotate', 'wiggle', 'zoom']) {
        await expect(candidate.locator(`.emoji-effect.${effect}`)).toHaveCSS(
          'animation-name',
          ecoMode ? 'none' : `tfm-stamp-${effect}`
        )
      }
      await expect(page.getByTestId('source')).toHaveText(text)
    }
  })
}

for (const markdown of [false, true]) {
  for (const [prefix, completed] of [
    [':scroll_00', ':scroll_00'],
    [':@al', ':@alice']
  ] as const) {
    test(`completes ${prefix} and chained effects with Markdown ${markdown}`, async ({
      page,
      input,
      load
    }) => {
      await load({ text: '', markdown })
      await input.focus()
      // insertText は Firefox で IME 経由になるため、通常のキー入力を使う。
      await input.pressSequentially(prefix)

      const source = page.getByTestId('source')
      const menu = page.getByRole('grid', { name: '入力候補' })
      await expect(menu).toBeVisible()
      await input.press('Tab')
      await expect(source).toHaveText(completed)
      await expect(input.locator('.message-emoji')).toHaveCount(0)
      await expect(
        menu
          .getByRole('group', { name: '補完のキーボード操作' })
          .getByText('.', { exact: true })
      ).toBeVisible()

      await input.press('.')
      await expect(source).toHaveText(completed + '.')
      const rotationPreview = menu
        .getByRole('gridcell', { name: '.rotate', exact: true })
        .locator('.message-emoji')
      await expect(rotationPreview).toHaveAttribute('title', completed + ':')
      await expect(
        menu.getByRole('gridcell').filter({ hasText: /^\.large$/ })
      ).toHaveCount(1)

      await input.pressSequentially('la')
      await input.press('.')
      await expect(source).toHaveText(completed + '.large.')
      await expect(rotationPreview).toHaveAttribute('title', completed + ':')
      await expect(rotationPreview).toHaveClass(/\blarge\b/)

      await input.pressSequentially('sm')
      await input.press('Tab')
      await expect(source).toHaveText(completed + '.large.small')
      await input.press('Enter')
      await expect(source).toHaveJSProperty(
        'textContent',
        completed + '.large.small: '
      )
      await expect(menu).toHaveCount(0)
      await expect(input).toBeFocused()
      await expect(page.getByTestId('posts')).toHaveText('0')
      if (markdown) await expect(input.locator('.message-emoji')).toBeVisible()
    })
  }
}
