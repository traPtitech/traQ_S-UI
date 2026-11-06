import { expect, test } from '../support'

const label = '#times/25/uni_kakurenbo/dump/trash'
const source =
  '!' + JSON.stringify({ type: 'channel', id: 'long-channel', raw: label })

for (const [width, markdown] of [
  [360, false],
  [360, true],
  [800, false],
  [800, true]
] as const) {
  test(`lays out a channel without an empty first line at ${width}px with Markdown ${markdown}`, async ({
    page,
    input,
    load,
    selectEditorOffsets
  }) => {
    await page.setViewportSize({ width, height: 720 })
    await load({ text: source, markdown })
    await selectEditorOffsets(1)
    const token = input.locator('.reference-token')
    await expect(token).toHaveText(label)

    const layout = await token.evaluate(element => {
      const range = document.createRange()
      range.selectNodeContents(element)
      const fragments = Array.from(range.getClientRects()).filter(
        rect => rect.width > 0 && rect.height > 0
      )
      const paragraph = element.closest('p')
      const first = fragments[0]
      if (!paragraph || !first) throw new Error('Missing token layout')

      return {
        firstLine: first.top - paragraph.getBoundingClientRect().top,
        fontSize: parseFloat(getComputedStyle(paragraph).fontSize),
        lines: new Set(fragments.map(rect => rect.top)).size
      }
    })

    if (width === 360) expect(layout.lines).toBeGreaterThan(1)
    else expect(layout.lines).toBe(1)
    expect(layout.firstLine).toBeLessThan(layout.fontSize)
    await expect(page.getByTestId('source')).toHaveText(source)
    await input.press('x')
    await expect(page.getByTestId('source')).toHaveText(source + 'x')
  })
}
