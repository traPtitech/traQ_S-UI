import { undo } from '@tiptap/pm/history'

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

describe('Markdown table', () => {
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
})
