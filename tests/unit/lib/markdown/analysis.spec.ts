import {
  analyzeMarkdownSource,
  isLiteralSource
} from '/@/lib/markdown/analysis'
import { getMarkdownRenderer } from '/@/lib/markdown/parser'
import { normalizeMessageSource } from '/@/lib/message/content'

it.each([
  '``` @alice',
  '~~~ @alice',
  '> ``` @alice',
  '- ``` @alice',
  '```\n```notclosed\n@alice #general',
  '```\n    ```\n@alice #general',
  '> ```\r\n> @alice\r\n> ```',
  '- item\n\t~~~\n\t@alice\n\t~~~',
  '`@alice` $@alice$',
  '$$\n@alice\n$$'
])(
  'preserves parser literal regions during message normalization: %s',
  text => {
    const analysis = analyzeMarkdownSource(text)
    const literals = analysis.nodes.filter(isLiteralSource)

    expect(literals.length).toBeGreaterThan(0)
    expect(
      literals.some(node => text.slice(node.from, node.to).includes('@alice'))
    ).toBe(true)
    expect(normalizeMessageSource(text)).toBe(text)

    for (const node of analysis.nodes) {
      expect(node.from).toBeGreaterThanOrEqual(0)
      expect(node.to).toBeLessThanOrEqual(text.length)
      expect(node.content.from).toBeGreaterThanOrEqual(node.from)
      expect(node.content.to).toBeGreaterThanOrEqual(node.content.from)
      expect(node.content.to).toBeLessThanOrEqual(node.to)
    }
  }
)

it.each(['```\n```', '~~~\n~~~~  ', '> ```\n> ```', '- ```\n  ```'])(
  'uses the parser closing fence boundary: %s',
  text => {
    const literal = analyzeMarkdownSource(text).nodes.find(
      node => node.kind === 'code-block'
    )
    expect(literal).toBeDefined()
    expect(
      literal?.syntax.map(range => text.slice(range.from, range.to))
    ).toHaveLength(2)
    expect(
      getMarkdownRenderer()
        .md.parse(text, {})
        .find(token => token.type === 'fence')?.content
    ).toBe('')
  }
)

it('maps links and styles back through CRLF, tab indentation and container prefixes', () => {
  const text = '> - **a\r\n>   b** and [label](https://example.com)'
  const { nodes } = analyzeMarkdownSource(text)
  const strong = nodes.find(
    node => node.kind === 'style' && node.tag === 'strong'
  )
  const link = nodes.find(node => node.kind === 'link')

  expect(strong && text.slice(strong.from, strong.to)).toBe('**a\r\n>   b**')
  expect(link).toMatchObject({ kind: 'link', href: 'https://example.com' })
  expect(link && text.slice(link.content.from, link.content.to)).toBe('label')
})
