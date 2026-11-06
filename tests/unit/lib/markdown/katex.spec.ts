import { readFile } from 'node:fs/promises'

import { createRuntime, presets } from '@traq-flavored-markdown/sdk'
import { withDefaultAdapters } from '@traq-flavored-markdown/sdk/adapters'
import { createHtmlRenderer } from '@traq-flavored-markdown/sdk/renderer'

const runtime = await createRuntime(
  await readFile('node_modules/@traq-flavored-markdown/sdk/dist/parser.wasm')
)
const parser = runtime.createParser(presets.traq.v1)
const renderer = createHtmlRenderer(withDefaultAdapters())
afterAll(() => runtime.dispose())

describe('Markdown math', () => {
  it.each([
    String.raw`$\frac{a}{b}$`,
    String.raw`$$
\frac{a}{b}
$$`
  ])('renders %s with the KaTeX stylesheet classes', text => {
    const container = document.createElement('div')
    container.innerHTML = renderer.render(parser.parse(text))

    expect(container.querySelector('.katex .katex-base .mfrac')).not.toBeNull()
    expect(container.querySelector('.katex-error')).toBeNull()
  })

  it('does not enable trusted HTML commands', () => {
    const container = document.createElement('div')
    container.innerHTML = renderer.render(
      parser.parse(String.raw`$\href{https://example.com}{link}$`)
    )

    expect(container.querySelector('a')).toBeNull()
  })
})
