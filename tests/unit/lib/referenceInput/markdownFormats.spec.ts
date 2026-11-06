import { getMarkdownRenderer } from '/@/lib/markdown/parser'
import { markdownFormats } from '/@/lib/referenceInput/markdown'

const inspect = (source: string) =>
  markdownFormats(source).map(format => ({
    type: format.className,
    source: source.slice(format.from, format.to),
    content: source.slice(format.content.from, format.content.to),
    syntax: format.syntax.map(range => source.slice(range.from, range.to))
  }))

describe('Markdown source decorations', () => {
  it.each(['**a\r\nb**', '**a\rb**', '**a\0b**'])(
    'maps normalized source back to the original text: %s',
    text => {
      expect(
        inspect(text).find(format => format.type === 'strong')
      ).toMatchObject({
        source: text,
        content: text.slice(2, -2),
        syntax: ['**', '**']
      })
    }
  )

  it('uses equivalent settings without mutating the message parser', () => {
    const renderer = getMarkdownRenderer()
    const text = 'example.dev https://example.com'
    const formats = inspect(text)
    const container = document.createElement('div')
    container.innerHTML = renderer.render(text).renderedText

    expect(formats.map(format => format.content)).toEqual(
      [...container.querySelectorAll('a')].map(link => link.textContent)
    )

    const linkify = renderer.md.options.linkify

    try {
      renderer.md.set({ linkify: false })
      expect(inspect(text)).toEqual(formats)
    } finally {
      renderer.md.set({ linkify })
    }
  })

  it('maps partially expanded tabs to the original list source', () => {
    expect(
      inspect('- a\n\t**b**').find(format => format.type === 'strong')
    ).toMatchObject({
      source: '**b**',
      content: 'b',
      syntax: ['**', '**']
    })
  })

  it('keeps separate markers for nested lists on the same line', () => {
    expect(
      markdownFormats('- - **a**').filter(
        format => format.className === 'bullet'
      )
    ).toHaveLength(2)
  })

  it('keeps image source intact without enabling image loading in message rendering', () => {
    const text = '![alt](https://example.com/image.png)'

    expect(markdownFormats(text)[0]?.replacement).toEqual({
      type: 'markdown',
      environment: { references: undefined },
      text
    })
    expect(getMarkdownRenderer().render(text).renderedText).not.toContain(
      '<img'
    )
  })

  it('tracks nested emphasis without losing the original delimiters', () => {
    expect(inspect('日本語 **bold _italic_** and ~~old~~')).toEqual([
      {
        type: 'emphasis',
        source: '_italic_',
        content: 'italic',
        syntax: ['_', '_']
      },

      {
        type: 'strong',
        source: '**bold _italic_**',
        content: 'bold _italic_',
        syntax: ['**', '**']
      },

      {
        type: 'strike',
        source: '~~old~~',
        content: 'old',
        syntax: ['~~', '~~']
      }
    ])
  })

  it('keeps escaped and unmatched delimiters as text and skips emphasis inside code', () => {
    expect(inspect('\\*literal* **unfinished `**code**`')).toEqual([
      {
        type: 'code',
        source: '`**code**`',
        content: '**code**',
        syntax: ['`', '`']
      }
    ])
  })

  it('maps links, entities, and Unicode to the original source positions', () => {
    expect(inspect('😀 &amp; [**label**](https://example.com/a_(b))')).toEqual([
      {
        type: 'strong',
        source: '**label**',
        content: 'label',
        syntax: ['**', '**']
      },

      {
        type: 'link',
        source: '[**label**](https://example.com/a_(b))',
        content: '**label**',
        syntax: ['[', '](https://example.com/a_(b))']
      }
    ])
  })

  it.each([
    [
      'https://example.com/path?q=1#part',
      ['https://example.com/path?q=1#part']
    ],
    ['(https://example.com/a_(b)).', ['https://example.com/a_(b)']],
    ['http://example.com/a_b_c', ['http://example.com/a_b_c']],
    ['example.com www.example.com', ['example.com', 'www.example.com']],
    ['https://example.com example.dev', ['https://example.com', 'example.dev']],
    ['example.dev https://example.com', ['example.dev', 'https://example.com']],
    [
      'example.app example.dev example.games example.tech example.show',
      [
        'example.app',
        'example.dev',
        'example.games',
        'example.tech',
        'example.show'
      ]
    ],
    [
      '😀 &amp; **example.com** and ~~example.dev~~',
      ['example.com', 'example.dev']
    ],
    ['`example.com` example.com', ['example.com']],
    ['**example.com** example.com', ['example.com', 'example.com']],
    ['\\*example.com and &amp; example.dev', ['example.dev']],
    [
      'alice@example.com ftp://example.com',
      ['alice@example.com', 'ftp://example.com']
    ],
    ['<https://example.com>', ['https://example.com']],
    ['<alice@example.com>', ['alice@example.com']],
    ['[example.com](https://example.dev)', ['example.com']],
    ['[label](https://example.dev) example.com', ['label', 'example.com']],
    ['![example.com](https://example.dev/image.png)', []],
    ['`https://example.com` $example.com$\n\n$$example.dev$$', []],
    ['```\nhttps://example.com\n```\n\n    example.dev', []],
    ['localhost example.invalid javascript:alert(1)', []]
  ])('marks only automatically recognized links in %s', (text, expected) => {
    const links = inspect(text).filter(format => format.type === 'link')

    expect(links.map(format => format.content)).toEqual(expected)

    for (const link of links) {
      expect(link.source).toContain(link.content)
    }
  })

  it.each(['> ', '- ', '> - '])(
    'maps automatic links through %j container prefixes and line breaks',
    prefix => {
      const text = `${prefix}example.com\n${prefix}https://example.dev`

      const links = markdownFormats(text).filter(
        format => format.className === 'link'
      )

      expect(
        links.map(format => ({ from: format.from, to: format.to }))
      ).toEqual([
        {
          from: text.indexOf('example.com'),
          to: text.indexOf('example.com') + 'example.com'.length
        },
        { from: text.indexOf('https://example.dev'), to: text.length }
      ])
    }
  )

  it('maps automatic links through repeated and escaped table cells', () => {
    const text =
      '| one | two |\n| --- | --- |\n| \\| example.com | example.com |'

    const links = markdownFormats(text).filter(
      format => format.className === 'link'
    )

    expect(links.map(format => format.from)).toEqual([
      text.indexOf('example.com'),
      text.lastIndexOf('example.com')
    ])
    expect(links.map(format => text.slice(format.from, format.to))).toEqual([
      'example.com',
      'example.com'
    ])
  })

  it('maps inline decorations through heading, quote, and list prefixes', () => {
    const source = '# **title**\n\n> **quote**\n\n- **item**'
    const formats = inspect(source)

    expect(
      formats
        .filter(format => format.type === 'strong')
        .map(format => format.source)
    ).toEqual(['**title**', '**quote**', '**item**'])

    expect(formats).toContainEqual({
      type: 'h1',
      source: '# **title**',
      content: '**title**',
      syntax: ['# ']
    })

    expect(formats).toContainEqual({
      type: 'quote',
      source: '> **quote**',
      content: '**quote**',
      syntax: ['> ']
    })

    expect(formats).toContainEqual({
      type: 'bullet',
      source: '- **item**',
      content: '-',
      syntax: ['-']
    })
  })

  it('does not parse decorations inside fenced code', () => {
    expect(inspect('```ts\n**literal**\n```')).toEqual([
      {
        type: 'code-block',
        source: '```ts\n**literal**\n```',
        content: '**literal**\n',
        syntax: ['```ts\n', '```']
      }
    ])
  })

  it('does not interpret emphasis inside a math expression', () => {
    const formats = markdownFormats('$x **y** z$\n\n$$a _b_ c$$')

    expect(formats.map(format => format.className)).toEqual([
      'math',
      'math-block'
    ])

    expect(formats.map(format => format.kind)).toEqual([
      'source-only',
      'source-only'
    ])
  })

  it('uses traQ highlight and spoiler delimiters', () => {
    expect(inspect('==marked== and !!secret!!')).toEqual([
      {
        type: 'highlight',
        source: '==marked==',
        content: 'marked',
        syntax: ['==', '==']
      },

      {
        type: 'spoiler',
        source: '!!secret!!',
        content: 'secret',
        syntax: ['!!', '!!']
      }
    ])
  })

  it('renders an image from its parsed destination and keeps unsafe destinations as source', () => {
    const image = markdownFormats(
      '![alt](https://example.com/image.png "title")'
    )[0]

    expect(image?.replacement).toEqual({
      type: 'markdown',
      environment: { references: undefined },
      text: '![alt](https://example.com/image.png "title")'
    })

    expect(markdownFormats('![alt](javascript:alert(1))')).toEqual([])
  })

  it('passes stamps and effects to the existing message renderer', () => {
    expect(
      markdownFormats(':traq.large: :@alice:').map(format => format.replacement)
    ).toEqual([
      {
        type: 'stamp',
        text: ':traq.large:',
        environment: { references: undefined }
      },
      {
        type: 'stamp',
        text: ':@alice:',
        environment: { references: undefined }
      }
    ])

    expect(markdownFormats('`:traq:`').map(format => format.className)).toEqual(
      ['code']
    )
  })

  it.each(['***nested***', '___nested___', '~~nested~~', '**one** **two**'])(
    'keeps every syntax range within its source: %s',
    text => {
      for (const format of markdownFormats(text)) {
        expect(format.from).toBeGreaterThanOrEqual(0)
        expect(format.to).toBeLessThanOrEqual(text.length)
        expect(format.content.from).toBeLessThanOrEqual(format.content.to)

        for (const syntax of format.syntax) {
          expect(syntax.from).toBeGreaterThanOrEqual(format.from)
          expect(syntax.to).toBeLessThanOrEqual(format.to)
        }
      }
    }
  )

  it('keeps container prefixes out of a nested heading delimiter', () => {
    expect(inspect('> # **title**')).toContainEqual({
      type: 'h1',
      source: '> # **title**',
      content: '**title**',
      syntax: ['# ']
    })
  })

  it('handles setext headings and multiline paragraphs', () => {
    expect(inspect('title\n=====\n\nfirst\n**next**')).toContainEqual({
      type: 'h1',
      source: 'title\n=====',
      content: 'title',
      syntax: ['\n=====']
    })

    expect(inspect('first\n**next**')).toEqual([
      {
        type: 'strong',
        source: '**next**',
        content: 'next',
        syntax: ['**', '**']
      }
    ])
  })

  it('maps repeated table cells independently within the table source range', () => {
    const table = '| **same** | **same** |\n| --- | --- |\n| one | two |'
    const formats = markdownFormats(table)

    expect(formats.filter(format => format.className === 'table')).toEqual([
      {
        className: 'table',
        kind: 'source-only',
        from: 0,
        to: table.length,
        content: { from: 0, to: table.length },
        syntax: []
      }
    ])

    expect(
      formats
        .filter(format => format.className === 'strong')
        .map(format => ({ from: format.from, to: format.to }))
    ).toEqual([
      { from: 2, to: 10 },
      { from: 13, to: 21 }
    ])
  })

  it.each(['', '> ', '- ', '  ', '> - '])(
    'maps formatted header and body cells through a %j container prefix',
    prefix => {
      const indent = prefix.replace(/[-+*]/g, ' ')

      const text =
        prefix +
        '| **same** | **same** |\n' +
        indent +
        '| --- | --- |\n' +
        indent +
        '| **same** | **same** |'

      expect(
        markdownFormats(text)
          .filter(format => format.className === 'strong')
          .map(format => format.from)
      ).toEqual([...text.matchAll(/\*\*same\*\*/g)].map(match => match.index))
    }
  )

  it.each([
    ['\\| **bold**', 'strong', '**bold**', 'bold'],
    ['**a\\|b**', 'strong', '**a\\|b**', 'a\\|b'],
    ['\\\\| _italic_', 'emphasis', '_italic_', 'italic'],
    ['😀 &amp; **bold**', 'strong', '**bold**', 'bold'],
    ['`a\\|b`', 'code', '`a\\|b`', 'a\\|b'],
    [
      '[a\\|b](https://example.com)',
      'link',
      '[a\\|b](https://example.com)',
      'a\\|b'
    ],
    ['**\uFFFC**', 'strong', '**\uFFFC**', '\uFFFC']
  ])(
    'maps cell formatting after table escapes and source atoms: %s',
    (cell, type, original, body) => {
      const text = `| first | second |\n| --- | --- |\n| ${cell} | ${cell} |`

      const formats = markdownFormats(text).filter(
        format => format.className === type
      )

      expect(formats.map(format => text.slice(format.from, format.to))).toEqual(
        [original, original]
      )
      expect(
        formats.map(format =>
          text.slice(format.content.from, format.content.to)
        )
      ).toEqual([body, body])
      expect(formats.map(format => format.from)).toEqual([
        text.indexOf(original),
        text.lastIndexOf(original)
      ])
    }
  )

  it('skips empty and absent cells and ignores columns beyond the rendered table width', () => {
    const text =
      'first | second\n--- | ---\n | **visible**\n**next**\n**last** | | **ignored**'

    expect(
      markdownFormats(text)
        .filter(format => format.className === 'strong')
        .map(format => text.slice(format.content.from, format.content.to))
    ).toEqual(['visible', 'next', 'last'])
  })

  it('does not extend formatting across a cell boundary or past the end of a table', () => {
    const text =
      '| **split | split** |\n| --- | --- |\n| **bold** | `**literal**` |\n\n**after**'

    expect(
      markdownFormats(text)
        .filter(format => format.className === 'strong')
        .map(format => text.slice(format.content.from, format.content.to))
    ).toEqual(['bold', 'after'])
  })
})
