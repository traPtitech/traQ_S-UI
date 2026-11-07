import { markdownParser } from '/@/lib/markdown/syntax'

describe('Markdown source positions', () => {
  it.each([
    '**example.dev** and https://example.com/a_b_c',
    '\\*example.com example.dev',
    'http\\://example.com and example.dev',
    'https://xn--bcher-kva.example.com/path example.dev',
    '> [**link**](https://example.com)\n> example.dev',
    '| link | stamp |\n| --- | --- |\n| example.dev | :traq: |',
    ':traq.large: and **:@alice:**',
    '![alt](https://example.com/image.png)',
    '!{"type":"user","id":"user","raw":"@alice"}',
    '!{"type":"channel","id":"channel","raw":"#general"}',
    '!{"type":"group","id":"group","raw":"@group"}',
    '$x^2$ and !!secret!!\n\n```\nexample.com\n```'
  ])('preserves the message renderer output and embeddings for %s', text => {
    expect(markdownParser.parseWithSyntax(text).document.document).toEqual(
      markdownParser.parse(text).document
    )
    expect(
      markdownParser.parseInlineWithSyntax(text).document.document
    ).toEqual(markdownParser.parseInline(text).document)
  })

  it('retains stamp data alongside its original source position', () => {
    const source = 'before :traq.large: after'
    const parsed = markdownParser.parseWithSyntax(source)
    const stamp = [...parsed.document.walk()].find(
      node => node.kind === 'traq.stamp'
    )
    if (!stamp) throw new Error('Expected a parsed stamp')
    expect(stamp.data).toMatchObject({
      literal: ':traq.large:',
      effects: { size: 'large' }
    })
    expect(stamp.span).toEqual({ start: 7, end: 19 })
    expect(parsed.syntaxFor(stamp).source).toBeDefined()
  })
})
