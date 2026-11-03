import type { Editor } from '@tiptap/core'
import { closeHistory, undo } from '@tiptap/pm/history'

import { inputLifecycleKey } from '/@/lib/referenceInput/inputLifecycle'
import { markdownPreviewKey } from '/@/lib/referenceInput/markdownPreview'
import { type Reference, encodeReference } from '/@/lib/references'

import { createInputEditor, readSource as source } from './fixture'

const renderPreview = vi.hoisted(() =>
  vi.fn(async (_text: string) => ({
    renderedText: '<table><tbody><tr><td>preview</td></tr></tbody></table>'
  }))
)

vi.mock('/@/lib/markdown/markdown', () => ({
  render: renderPreview,
  renderInline: renderPreview
}))

const create = (
  source: string,
  message = true,
  label = (reference: Reference) => reference.raw
) => createInputEditor(source, { mode: message ? 'message' : 'search', label })

const configure = (
  editor: Editor,
  options: { enabled?: boolean; focused?: boolean; composing?: boolean }
) => {
  const { enabled: markdown, ...lifecycle } = options
  editor.view.dispatch(
    editor.state.tr.setMeta(inputLifecycleKey, {
      ...lifecycle,
      ...(markdown === undefined ? {} : { markdown })
    })
  )
}

describe('inline Markdown preview', () => {
  it('reuses unchanged decorations and defers analysis until composition ends', () => {
    const editor = create('**bold** plain')
    configure(editor, { enabled: true, focused: true })
    const initial = markdownPreviewKey.getState(editor.state)
    editor.commands.setTextSelection(11)

    expect(markdownPreviewKey.getState(editor.state)?.decorations).toBe(
      initial?.decorations
    )

    configure(editor, { composing: true })
    editor.commands.insertContent('new ')

    expect(markdownPreviewKey.getState(editor.state)?.formats).toBe(
      initial?.formats
    )

    configure(editor, { composing: false })

    expect(markdownPreviewKey.getState(editor.state)?.formats).not.toBe(
      initial?.formats
    )
    expect(
      editor.view.dom.querySelector('.markdown-input-strong')?.textContent
    ).toBe('bold')
  })

  it('updates automatic link styling while editing and undoing without changing source or selection', () => {
    const editor = create('URL: example')
    configure(editor, { enabled: true, focused: true })
    editor.commands.setTextSelection(editor.state.doc.content.size - 1)
    editor.commands.insertContent('.com')

    expect(
      editor.view.dom.querySelector('.markdown-input-link')?.textContent
    ).toBe('example.com')
    expect(editor.view.dom.querySelector('a')).toBeNull()
    expect(source(editor)).toBe('URL: example.com')
    expect(editor.state.selection.head).toBe('URL: example.com'.length + 1)

    editor.view.dispatch(closeHistory(editor.state.tr))

    editor.commands.deleteRange({
      from: 'URL: example'.length + 1,
      to: editor.state.selection.head
    })

    expect(editor.view.dom.querySelector('.markdown-input-link')).toBeNull()
    expect(source(editor)).toBe('URL: example')

    undo(editor.state, editor.view.dispatch)

    expect(source(editor)).toBe('URL: example.com')
    expect(
      editor.view.dom.querySelector('.markdown-input-link')?.textContent
    ).toBe('example.com')

    const selection = editor.state.selection.toJSON()
    configure(editor, { enabled: false })

    expect(editor.view.dom.querySelector('.markdown-input-link')).toBeNull()
    expect(editor.state.selection.toJSON()).toEqual(selection)
    expect(source(editor)).toBe('URL: example.com')
  })

  it('waits until composition ends before styling a newly recognized domain', () => {
    const editor = create('example')
    configure(editor, { enabled: true, focused: true })
    editor.commands.setTextSelection(editor.state.doc.content.size - 1)
    configure(editor, { composing: true })
    editor.commands.insertContent('.com')

    expect(editor.view.dom.querySelector('.markdown-input-link')).toBeNull()

    const selection = editor.state.selection.toJSON()
    configure(editor, { composing: false })

    expect(
      editor.view.dom.querySelector('.markdown-input-link')?.textContent
    ).toBe('example.com')
    expect(editor.state.selection.toJSON()).toEqual(selection)
    expect(source(editor)).toBe('example.com')
  })

  it('formats table cells while keeping the structural source visible and editable', () => {
    const original =
      '| **bold** | _italic_ | [label](url) |\n| --- | --- | --- |\n| ~~old~~ | ==marked== | `code` |'
    const editor = create(original)
    configure(editor, { enabled: true, focused: true })

    for (const [type, content] of [
      ['strong', 'bold'],
      ['emphasis', 'italic'],
      ['link', 'label'],
      ['strike', 'old'],
      ['highlight', 'marked'],
      ['code', 'code']
    ]) {
      expect(
        editor.view.dom.querySelector('.markdown-input-' + type)?.textContent
      ).toBe(content)
    }

    expect(
      editor.view.dom.querySelector('table, details, .markdown-input-hidden')
    ).toBeNull()
    expect(
      editor.view.dom.querySelector('.markdown-input-source')
    ).not.toBeNull()
    expect(editor.view.dom.textContent).toBe(original)
    expect(source(editor)).toBe(original)
  })

  it('preserves formatted table references while editing, toggling, and undoing', () => {
    const reference = encodeReference({
      type: 'user',
      id: 'original-id',
      raw: '@stored'
    })

    const original = `| **${reference}** | _tail_ |\n| --- | --- |`
    const editor = create(original, true, () => '@alice')
    const position = original.replace(reference, '\uFFFC').indexOf('\uFFFC') + 2
    configure(editor, { enabled: true, focused: true })

    expect(
      editor.view.dom
        .querySelector('.reference-token')
        ?.closest('.markdown-input-strong')
    ).not.toBeNull()

    editor.commands.setTextSelection(position)
    editor.commands.insertContent(' added')

    expect(source(editor)).toBe(
      original.replace(reference, reference + ' added')
    )

    const selection = editor.state.selection.toJSON()
    configure(editor, { enabled: false })
    configure(editor, { enabled: true })

    expect(editor.state.selection.toJSON()).toEqual(selection)
    expect(editor.view.dom.querySelector('.reference-token')?.textContent).toBe(
      '@alice'
    )

    undo(editor.state, editor.view.dispatch)

    expect(source(editor)).toBe(original)
    expect(
      editor.view.dom
        .querySelector('.reference-token')
        ?.closest('.markdown-input-strong')
    ).not.toBeNull()
  })

  it('keeps code and math inside table cells as literal source', () => {
    const original = '| `**code**` | $x **y** z$ |\n| --- | --- |'
    const editor = create(original)
    configure(editor, { enabled: true })

    expect(
      editor.view.dom.querySelector('.markdown-input-code')?.textContent
    ).toBe('**code**')
    expect(editor.view.dom.querySelector('.markdown-input-strong')).toBeNull()
    expect(editor.view.dom.querySelector('.katex')).toBeNull()
    expect(source(editor)).toBe(original)
  })

  it('waits until composition ends before applying newly completed cell formatting', () => {
    const original = '| **first** | **new |\n| --- | --- |'
    const editor = create(original)
    configure(editor, { enabled: true, focused: true })
    const position = original.indexOf('**new') + '**new'.length + 1
    editor.commands.setTextSelection(position)
    configure(editor, { composing: true })
    editor.commands.insertContent('**')

    expect(
      editor.view.dom.querySelectorAll('.markdown-input-strong')
    ).toHaveLength(1)

    const selection = editor.state.selection.toJSON()
    configure(editor, { composing: false })

    expect(
      editor.view.dom.querySelectorAll('.markdown-input-strong')
    ).toHaveLength(2)
    expect(editor.state.selection.toJSON()).toEqual(selection)
    expect(source(editor)).toBe(original.replace('**new', '**new**'))
  })

  it.each(['', '> ', '- ', '> - '])(
    'keeps other cells inactive while editing and composing with a %j prefix',
    prefix => {
      const original =
        prefix +
        '| **first** | [label](url) | !!secret!! |\n' +
        prefix.replace('-', ' ') +
        '| --- | --- | --- |'

      const editor = create(original)
      configure(editor, { enabled: true, focused: true })
      editor.commands.setTextSelection(original.indexOf('first') + 3)
      const link = editor.view.dom.querySelector('.markdown-input-link')
      const spoiler = editor.view.dom.querySelector('.markdown-input-spoiler')
      configure(editor, { composing: true })

      expect(editor.view.dom.querySelector('.markdown-input-link')).toBe(link)
      expect(editor.view.dom.querySelector('.markdown-input-spoiler')).toBe(
        spoiler
      )
      expect(link?.classList.contains('markdown-input-active')).toBe(false)
      expect(spoiler?.classList.contains('markdown-input-active')).toBe(false)
      editor.commands.insertContent('日本語')
      configure(editor, { composing: false })

      expect(editor.view.dom.querySelector('.markdown-input-link')).toBe(link)
      expect(editor.view.dom.querySelector('.markdown-input-spoiler')).toBe(
        spoiler
      )
      expect(link?.classList.contains('markdown-input-active')).toBe(false)
      expect(spoiler?.classList.contains('markdown-input-active')).toBe(false)
      expect(source(editor)).toBe(original.replace('first', 'fi日本語rst'))

      editor.commands.setTextSelection(source(editor).indexOf('secret') + 2)

      expect(
        editor.view.dom.querySelector(
          '.markdown-input-spoiler.markdown-input-active'
        )
      ).not.toBeNull()

      editor.commands.setTextSelection(original.indexOf('first') + 3)

      expect(
        editor.view.dom.querySelector(
          '.markdown-input-spoiler.markdown-input-active'
        )
      ).toBeNull()
    }
  )

  it.each(['', '> ', '- ', '> - '])(
    'edits only the rendered stamp cell with a %j prefix',
    prefix => {
      const original =
        prefix + '| :x: | :y: |\n' + prefix.replace('-', ' ') + '| --- | --- |'
      const editor = create(original)
      configure(editor, { enabled: true, focused: true })
      editor.commands.setTextSelection(original.indexOf(':x:') + 4)

      for (const expected of [
        original.replace(':x:', ':x'),
        original.replace(':x:', ':')
      ]) {
        editor.view.dom.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'Backspace',
            bubbles: true,
            cancelable: true
          })
        )

        expect(source(editor)).toBe(expected)
        expect(
          [...editor.view.dom.querySelectorAll('.markdown-input-hidden')].map(
            node => node.textContent
          )
        ).toEqual([':y:'])
        expect(
          editor.view.dom.querySelectorAll('.markdown-input-rendered')
        ).toHaveLength(1)
      }

      undo(editor.state, editor.view.dispatch)

      expect(source(editor)).toBe(original)
    }
  )

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

  it.each(['| label |\n| --- |\n| value |', '$$\nx^2\n$$', '$x^2$'])(
    'keeps recognized Markdown editable at its source end: %s',
    text => {
      const original = text + '\n\nafter'
      const editor = create(original)
      const element = editor.view.dom
      document.body.append(element)

      try {
        editor.view.focus()
        configure(editor, { enabled: true, focused: true })
        editor.commands.setTextSelection(text.length + 1)

        const selection = document.getSelection()
        expect(selection?.anchorNode?.nodeType).toBe(Node.TEXT_NODE)
        expect(selection?.anchorNode?.textContent).toBe(text)
        expect(selection?.anchorOffset).toBe(text.length)

        if (!selection?.anchorNode) throw new Error('Missing source caret')

        expect(
          editor.view.posAtDOM(selection.anchorNode, selection.anchorOffset)
        ).toBe(text.length + 1)
        expect(source(editor)).toBe(original)
      } finally {
        element.remove()
      }
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

  it('updates the recognized table source during editing and restores it on Undo', () => {
    renderPreview.mockClear()
    const original = '| label |\n| --- |\n| value |'
    const editor = create(original)
    configure(editor, { enabled: true, focused: true })
    editor.commands.insertContentAt(original.indexOf('value') + 1, 'new ')
    const changed = original.replace('value', 'new value')

    expect(source(editor)).toBe(changed)
    expect(
      editor.view.dom.querySelector('.markdown-input-source')?.textContent
    ).toBe(changed)
    expect(renderPreview).not.toHaveBeenCalled()

    undo(editor.state, editor.view.dispatch)

    expect(source(editor)).toBe(original)
    expect(
      editor.view.dom.querySelector('.markdown-input-source')?.textContent
    ).toBe(original)
    expect(editor.view.dom.querySelector('.ProseMirror-widget')).toBeNull()
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

  it('preserves reference labels and IDs within the recognized table source', () => {
    renderPreview.mockClear()

    const reference = encodeReference({
      type: 'user',
      id: 'original-id',
      raw: '@stored'
    })

    const original = '| person |\n| --- |\n| ' + reference + ' |'
    const editor = create(original, true, () => '@alice')
    configure(editor, { enabled: true })

    expect(editor.view.dom.querySelector('.reference-token')?.textContent).toBe(
      '@alice'
    )
    expect(
      editor.view.dom.querySelector(
        '.markdown-input-source .reference-token, .reference-token.markdown-input-source'
      )
    ).not.toBeNull()
    expect(source(editor)).toBe(original)
    expect(renderPreview).not.toHaveBeenCalled()
    expect(editor.view.dom.querySelector('.ProseMirror-widget')).toBeNull()
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

  it('preserves Markdown, references, selection, and Undo when toggled', () => {
    const reference = encodeReference({
      type: 'user',
      id: 'original-id',
      raw: '@alice'
    })

    const original = `**hello ${reference}**`
    const editor = create(original)
    editor.commands.setTextSelection(4)
    editor.commands.insertContent('new')
    const before = source(editor)
    const selection = editor.state.selection.toJSON()
    configure(editor, { enabled: true })

    expect(source(editor)).toBe(before)
    expect(editor.state.selection.toJSON()).toEqual(selection)

    expect(editor.view.dom.querySelector('.reference-token')?.textContent).toBe(
      '@alice'
    )

    configure(editor, { enabled: false })

    expect(editor.view.dom.querySelector('.markdown-input-strong')).toBeNull()
    expect(source(editor)).toBe(before)

    undo(editor.state, editor.view.dispatch)

    expect(source(editor)).toBe(original)
  })

  it.each([
    [1, '日本語:x: and **second**'],
    [4, ':x:日本語 and **second**']
  ])(
    'keeps the caret at source position %s without inserting its anchor into the source',
    (position, after) => {
      const original = ':x: and **second**'
      const editor = create(original)
      configure(editor, { enabled: true, focused: true })
      editor.commands.setTextSelection(position)

      const anchor = editor.view.dom.querySelector(
        '.markdown-input-caret-anchor'
      )

      expect(anchor?.textContent).toBe('\u200B')
      expect(anchor?.getAttribute('aria-hidden')).toBe('true')
      expect(source(editor)).toBe(original)
      expect(editor.state.selection.head).toBe(position)

      configure(editor, { composing: true })

      expect(
        editor.view.dom.querySelector('.markdown-input-caret-anchor')
      ).toBe(anchor)

      editor.commands.insertContent('日本語')
      configure(editor, { composing: false })

      expect(source(editor)).toBe(after)
      expect(editor.state.selection.head).toBe(position + 3)

      undo(editor.state, editor.view.dispatch)

      expect(source(editor)).toBe(original)

      configure(editor, { focused: false })

      expect(
        editor.view.dom.querySelector('.markdown-input-caret-anchor')
      ).toBeNull()
    }
  )

  it.each(['before', 'inside', 'after'])(
    'preserves surrounding Markdown while composing %s a formatted range',
    location => {
      const original = 'plain **first** and [second](url) tail'

      const position =
        location === 'before'
          ? 3
          : location === 'inside'
            ? 11
            : original.length + 1

      const editor = create(original)
      configure(editor, { enabled: true, focused: true })
      editor.commands.setTextSelection(position)

      const guides = [
        ...editor.view.dom.querySelectorAll('.markdown-input-syntax')
      ]

      const syntax = guides.map(node => node.textContent)
      const link = editor.view.dom.querySelector('.markdown-input-link')
      configure(editor, { composing: true })

      expect(editor.view.dom.querySelector('.markdown-input-link')).toBe(link)

      expect([
        ...editor.view.dom.querySelectorAll('.markdown-input-syntax')
      ]).toEqual(guides)

      for (const text of ['に', '日本語']) {
        const from = position
        const to = editor.state.selection.head
        editor.view.dispatch(editor.state.tr.insertText(text, from, to))

        expect(source(editor)).toBe(
          original.slice(0, position - 1) + text + original.slice(position - 1)
        )

        expect(editor.state.selection.head).toBe(position + text.length)

        const current = [
          ...editor.view.dom.querySelectorAll('.markdown-input-syntax')
        ]

        expect(current).toHaveLength(guides.length)

        expect(current.map(node => node.textContent)).toEqual(syntax)

        expect(
          editor.view.dom.querySelector('.markdown-input-link')?.textContent
        ).toBe('second')
      }

      configure(editor, { composing: false })

      expect(editor.state.selection.head).toBe(position + 3)
      expect(
        editor.view.dom.querySelector('.markdown-input-link')?.textContent
      ).toBe('second')
    }
  )

  it.each(['**aaa**', '[aaa](aaa)'])(
    'keeps guides visible when composition starts after %s',
    text => {
      const original = `${text} and **other**`
      const editor = create(original)
      configure(editor, { enabled: true, focused: true })
      editor.commands.setTextSelection(text.length + 1)
      configure(editor, { composing: true })

      expect(source(editor)).toBe(original)
      expect(editor.state.selection.head).toBe(text.length + 1)

      expect(
        [...editor.view.dom.querySelectorAll('.markdown-input-syntax')].map(
          node => node.textContent
        )
      ).toEqual(
        text.startsWith('**')
          ? ['**', '**', '**', '**']
          : ['[', '](aaa)', '**', '**']
      )

      expect(
        editor.view.dom.querySelectorAll('.markdown-input-hidden')
      ).toHaveLength(0)

      editor.commands.insertContent('日本語')
      configure(editor, { composing: false })

      expect(source(editor)).toBe(`${text}日本語 and **other**`)
      expect(editor.state.selection.head).toBe(text.length + 4)
    }
  )

  it('waits until composition ends before rendering newly completed Markdown', () => {
    const editor = create('**first** and **new')
    configure(editor, { enabled: true, focused: true })
    editor.commands.setTextSelection(editor.state.doc.content.size - 1)
    configure(editor, { composing: true })
    editor.commands.insertContent('**')

    expect(
      editor.view.dom.querySelectorAll('.markdown-input-strong')
    ).toHaveLength(1)

    expect(source(editor)).toBe('**first** and **new**')

    configure(editor, { composing: false })

    expect(
      editor.view.dom.querySelectorAll('.markdown-input-strong')
    ).toHaveLength(2)

    expect(source(editor)).toBe('**first** and **new**')
  })

  it('does not enable Markdown rendering for a search input', () => {
    const editor = create('**search**', false)

    expect(markdownPreviewKey.getState(editor.state)).toBeUndefined()

    configure(editor, { enabled: true })

    expect(editor.view.dom.querySelector('.markdown-input-strong')).toBeNull()
  })
})

it('retains a clicked widget source until the unfocused editor receives focus', () => {
  const editor = create(':traq:')
  configure(editor, { enabled: true, focused: false })
  editor.commands.setTextSelection(1)
  expect(
    editor.view.dom.querySelector('.markdown-input-rendered')
  ).not.toBeNull()
  editor.view.dispatch(
    editor.state.tr.setMeta(markdownPreviewKey, {
      revealed: [{ from: 0, to: 6 }]
    })
  )
  configure(editor, { focused: true })
  expect(editor.view.dom.querySelector('.markdown-input-rendered')).toBeNull()
  expect(source(editor)).toBe(':traq:')
})
