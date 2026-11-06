import { encodeReference } from '/@/lib/references'

import { installInputEditorFixture, readSource as source } from './fixture'
import { configure, create } from './previewFixture'

installInputEditorFixture()

const renderPreview = vi.hoisted(() =>
  vi.fn(async (_text: string) => ({
    renderedText: '<table><tbody><tr><td>preview</td></tr></tbody></table>'
  }))
)

vi.mock('/@/lib/markdown/markdown', () => ({
  render: renderPreview,
  renderInline: renderPreview
}))

describe('Markdown decorations', () => {
  it('shows one quote bar per parsed depth on explicit and lazy continuation lines', () => {
    const original = '> > **first _nested_**\n> second\n\nplain'
    const editor = create(original)
    configure(editor, { enabled: true })

    const guides = [
      ...editor.view.dom.querySelectorAll('.markdown-input-container-guide')
    ]

    expect(
      guides.map(
        guide => guide.querySelectorAll('.markdown-input-quote-bar').length
      )
    ).toEqual([2, 2])
    expect(
      guides.map(guide => (guide as HTMLElement).style.paddingInlineEnd)
    ).toEqual(['0ch', '2ch'])
    expect(source(editor)).toBe(original)
  })

  it.each([
    ['**_nested_**', ['strong', 'emphasis']],
    ['_**nested**_', ['emphasis', 'strong']],
    ['***nested***', ['strong', 'emphasis']],
    ['# **_nested_**', ['h1', 'strong', 'emphasis']],
    ['~~**nested**~~', ['strike', 'strong']],
    ['==_nested_==', ['highlight', 'emphasis']],
    ['[**nested**](url)', ['link', 'strong']],
    ['**[nested](url)**', ['strong', 'link']],
    ['**`nested`**', ['strong', 'code']],
    ['!!**nested**!!', ['spoiler', 'strong']],
    ['> **_nested_**', ['quote', 'strong', 'emphasis']],
    ['| **_nested_** |\n| --- |', ['strong', 'emphasis']]
  ])(
    'formats only the body and leaves nested syntax guides plain: %s',
    (text, styles) => {
      const editor = create(text)
      configure(editor, { enabled: true })
      const element = editor.view.dom

      const formatted = [
        'strong',
        'emphasis',
        'strike',
        'highlight',
        'spoiler',
        'link',
        'code',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6'
      ]
        .map(style => '.markdown-input-' + style)
        .join(', ')

      const guides = [...element.querySelectorAll('.markdown-input-syntax')]

      expect(guides.length).toBeGreaterThan(0)

      for (const guide of guides) {
        expect(guide.closest(formatted)).toBeNull()
      }

      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
      let body = walker.nextNode()

      while (body && body.textContent !== 'nested') body = walker.nextNode()

      expect(body).not.toBeNull()

      for (const style of styles) {
        expect(
          body?.parentElement?.closest('.markdown-input-' + style)
        ).not.toBeNull()
      }

      expect(source(editor)).toBe(text)
    }
  )

  it.each([
    '| label |\n| --- |\n| value |',
    '$$\nx^2 + y^2\n$$',
    '$x^2 + y^2$',
    '$x **y** z$'
  ])(
    'only marks recognized source through focus and selection changes: %s',
    text => {
      const editor = create(text)
      configure(editor, { enabled: true })
      const block = editor.view.dom.querySelector('.markdown-input-source')
      expect(block).not.toBeNull()

      for (const focused of [false, true]) {
        configure(editor, { focused })

        for (const position of [1, 4, text.length + 1]) {
          editor.commands.setTextSelection(position)

          expect(editor.view.dom.querySelector('.markdown-input-source')).toBe(
            block
          )
          expect(block?.textContent).toBe(text)
          expect(
            editor.view.dom.querySelector(
              '.markdown-input-hidden, .ProseMirror-widget, details'
            )
          ).toBeNull()
          expect(source(editor)).toBe(text)
        }
      }
    }
  )

  it('keeps inline math as raw source inside other text formatting', () => {
    const original = '**before $x^2$ after**'
    const editor = create(original)
    configure(editor, { enabled: true })
    const math = editor.view.dom.querySelector('.markdown-input-source')

    expect(math?.textContent).toBe('$x^2$')
    expect(math?.closest('.markdown-input-strong')).toBeNull()
    expect(editor.view.dom.querySelector('.ProseMirror-widget')).toBeNull()
    expect(source(editor)).toBe(original)
  })

  it.each([
    ['#', ['#']],
    ['##', ['##']],
    ['###', ['###']],
    ['####', ['####']],
    ['#####', ['#####']],
    ['######', ['######']],
    ['# ', ['# ']],
    ['## \t', ['## \t']],
    ['> #', ['> ', '#']],
    ['- ##', ['-', '##']]
  ])('keeps an empty heading visible as a syntax guide: %s', (text, guide) => {
    const editor = create(text)
    editor.commands.setTextSelection(editor.state.doc.content.size - 1)
    configure(editor, { enabled: true })

    for (const focused of [false, true]) {
      configure(editor, { focused })

      expect(
        [...editor.view.dom.querySelectorAll('.markdown-input-syntax')].map(
          node => node.textContent
        )
      ).toEqual(guide)

      expect(
        editor.view.dom.querySelector('.markdown-input-syntax[aria-hidden]')
      ).toBeNull()

      expect(source(editor)).toBe(text)
      expect(editor.state.selection.head).toBe(text.length + 1)
    }
  })

  it('keeps the heading guide visible while text is added and cleared', () => {
    const editor = create('# ')
    editor.commands.setTextSelection(3)
    configure(editor, { enabled: true })
    editor.commands.insertContent('title')

    expect(
      editor.view.dom.querySelector('.markdown-input-syntax')?.textContent
    ).toBe('# ')
    expect(
      editor.view.dom.querySelector('.markdown-input-h1')?.textContent
    ).toBe('title')

    expect(source(editor)).toBe('# title')

    editor.commands.setTextSelection({ from: 3, to: 8 })
    editor.commands.deleteSelection()

    expect(
      editor.view.dom.querySelector('.markdown-input-syntax')?.textContent
    ).toBe('# ')

    expect(source(editor)).toBe('# ')
    expect(editor.state.selection.head).toBe(3)
  })

  it('shows guides for both completed formatting and an empty heading', () => {
    const editor = create('**other**\n\n#')
    configure(editor, { enabled: true })

    expect(
      [...editor.view.dom.querySelectorAll('.markdown-input-syntax')].map(
        node => node.textContent
      )
    ).toEqual(['**', '**', '#'])

    expect(
      editor.view.dom.querySelector('.markdown-input-strong')?.textContent
    ).toBe('other')

    expect(
      [...editor.view.dom.querySelectorAll('.markdown-input-hidden')].map(
        node => node.textContent
      )
    ).toEqual([])
  })

  it('keeps reference labels and IDs intact beside a visible heading guide', () => {
    const mention = encodeReference({
      type: 'user',
      id: 'user-id',
      raw: '@alice'
    })

    const original = `## ${mention}`
    const editor = create(original)
    configure(editor, { enabled: true })

    expect(
      editor.view.dom.querySelector('.markdown-input-syntax')?.textContent
    ).toBe('## ')
    expect(editor.view.dom.querySelector('.reference-token')?.textContent).toBe(
      '@alice'
    )

    expect(source(editor)).toBe(original)
  })

  it.each([
    ['# title', ['# ']],
    ['**bold**', ['**', '**']],
    ['_italic_', ['_', '_']],
    ['~~old~~', ['~~', '~~']],
    ['==marked==', ['==', '==']],
    ['!!secret!!', ['!!', '!!']],
    ['`code`', ['`', '`']],
    ['[label](url)', ['[', '](url)']],
    ['> quote', ['> ']],
    ['- item', ['-']],
    ['---', ['---']],
    ['```ts\nx\n```', ['```ts\n', '```']],
    ['title\n===', ['\n===']]
  ])(
    'keeps syntax guides visible regardless of focus or caret position: %s',
    (text, guide) => {
      const editor = create(text)
      configure(editor, { enabled: true })

      for (const focused of [false, true]) {
        configure(editor, { focused })

        for (const position of [
          1,
          Math.ceil(text.length / 2),
          text.length + 1
        ]) {
          editor.commands.setTextSelection(position)

          expect(
            [...editor.view.dom.querySelectorAll('.markdown-input-syntax')].map(
              node => node.textContent
            )
          ).toEqual(guide)

          expect(
            editor.view.dom.querySelector('.markdown-input-hidden')
          ).toBeNull()
          expect(source(editor)).toBe(text)
        }
      }
    }
  )

  it('keeps guides visible for all formatted ranges when the caret moves or focus leaves', () => {
    const editor = create('**first** and **second**')
    configure(editor, { enabled: true, focused: true })
    editor.commands.setTextSelection(4)

    expect(
      [...editor.view.dom.querySelectorAll('.markdown-input-syntax')].map(
        node => node.textContent
      )
    ).toEqual(['**', '**', '**', '**'])

    expect(
      [...editor.view.dom.querySelectorAll('.markdown-input-hidden')].map(
        node => node.textContent
      )
    ).toEqual([])

    configure(editor, { focused: false })

    expect(
      editor.view.dom.querySelectorAll('.markdown-input-syntax')
    ).toHaveLength(4)

    expect(
      editor.view.dom.querySelectorAll('.markdown-input-hidden')
    ).toHaveLength(0)
  })
})
