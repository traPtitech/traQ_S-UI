import { Editor } from '@tiptap/core'

import { inputExtensions, partsToContent } from '/@/lib/referenceInput/editor'
import { readInputDocument } from '/@/lib/referenceInput/editorDocument'
import { parseInput } from '/@/lib/references'

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
    content: partsToContent(parseInput(source, mode)),
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

afterEach(() => editors.splice(0).forEach(editor => editor.destroy()))
