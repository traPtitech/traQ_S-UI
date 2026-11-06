import { markdownPreviewKey } from '/@/lib/referenceInput/markdownPreviewState'

import { installInputEditorFixture } from './fixture'
import { configure, create } from './previewFixture'

installInputEditorFixture()

it('keeps widget identity independent of another document environment', () => {
  const text = '![a][ref]\n\n[ref]: https://example.com/a\n\ntail'
  const editor = create(text)
  configure(editor, { enabled: true })
  editor.commands.setTextSelection(text.length + 1)
  const widget = editor.view.dom.querySelector('.markdown-input-rendered')
  expect(widget).not.toBeNull()

  const other = create('![a][ref]\n\n[ref]: https://example.com/b')
  configure(other, { enabled: true })
  editor.commands.insertContent('!')

  expect(editor.view.dom.querySelector('.markdown-input-rendered')).toBe(widget)
})

it.each([
  { name: 'readonly', editable: false },
  { name: 'composition', composing: true },
  { name: 'Shift', shiftKey: true },
  { name: 'Control', ctrlKey: true },
  { name: 'Meta', metaKey: true },
  { name: 'Alt', altKey: true }
])('preserves selection for a $name widget click', options => {
  const editor = create(':x: tail')
  configure(editor, { enabled: true })
  editor.commands.setTextSelection(8)
  const widget = editor.view.dom.querySelector('.markdown-input-rendered')
  expect(widget).not.toBeNull()

  if (typeof options.editable === 'boolean')
    editor.setEditable(options.editable)
  if ('composing' in options)
    configure(editor, { composing: options.composing })

  const selection = editor.state.selection
  const revealed = markdownPreviewKey.getState(editor.state)?.revealed
  widget?.dispatchEvent(
    new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      detail: 1,
      ...options
    })
  )

  expect(editor.state.selection.eq(selection)).toBe(true)
  expect(markdownPreviewKey.getState(editor.state)?.revealed).toEqual(revealed)
})

it('reveals a widget through the shared pointer handler', () => {
  const editor = create(':x: tail')
  configure(editor, { enabled: true, focused: true })
  editor.commands.setTextSelection(8)
  const widget = editor.view.dom.querySelector('.markdown-input-rendered')
  expect(widget).not.toBeNull()

  widget?.dispatchEvent(
    new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      detail: 1
    })
  )

  expect(editor.state.selection.head).toBe(4)
  expect(markdownPreviewKey.getState(editor.state)?.revealed).toEqual([
    { from: 0, to: 3 }
  ])
})
