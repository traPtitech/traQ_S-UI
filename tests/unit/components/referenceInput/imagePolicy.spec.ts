import { renderInlineWithCurrentEntities } from '../../lib/markdown/fixture'
import { installReferenceInputFixture, makeInput } from './fixture'

await vi.hoisted(async () => {
  await import('./mocks')
})
installReferenceInputFixture()

it('uses the message renderer image policy in the traQ input profile', async () => {
  const source = '![x](https://example.com/image.png)'
  const input = await makeInput({ source })
  await input.setProps({ markdown: true })
  const widget = input.get('.markdown-input-rendered')
  expect(widget.element.innerHTML).toBe(
    renderInlineWithCurrentEntities(source).renderedText
  )
  expect(widget.find('img').exists()).toBe(false)
})
it('keeps rejected image destinations out of the traQ profile rendering', async () => {
  const input = await makeInput({ source: '![x](javascript:alert(1))' })
  await input.setProps({ markdown: true })
  expect(
    input
      .find('.markdown-input-rendered a[href], .markdown-input-rendered img')
      .exists()
  ).toBe(false)
})
