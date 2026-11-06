import { Editor } from '@tiptap/core'

import { inputExtensions } from '/@/lib/referenceInput/editor'
import {
  readInputDocument,
  sourceToContent
} from '/@/lib/referenceInput/editorDocument'

const editors: Editor[] = []

export const createInputEditor = (
  source: string,
  options: Partial<Parameters<typeof inputExtensions>[0]> = {}
) => {
  const mode = options.mode ?? 'message'
  const editor = new Editor({
    extensions: inputExtensions({
      label: reference => reference.raw,
      ...options,
      mode
    }),
    content: sourceToContent(source, mode),
    enableCoreExtensions: { keymap: false },
    enableInputRules: false,
    enablePasteRules: false,
    editorProps: { handleScrollToSelection: () => true }
  })

  editors.push(editor)
  return editor
}

export const readSource = readInputDocument

export const pressKey = (
  editor: Editor,
  key: string,
  options: KeyboardEventInit = {}
) => {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...options
  })
  editor.view.dom.dispatchEvent(event)
  return event
}

export const installInputEditorFixture = () => {
  afterEach(() => editors.splice(0).forEach(editor => editor.destroy()))
}
