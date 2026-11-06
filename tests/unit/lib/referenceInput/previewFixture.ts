import type { Editor } from '@tiptap/core'

import { inputLifecycleKey } from '/@/lib/referenceInput/inputLifecycle'
import type { Reference } from '/@/lib/references'

import { createInputEditor } from './fixture'

export const create = (
  source: string,
  message = true,
  label = (reference: Reference) => reference.raw
) => createInputEditor(source, { mode: message ? 'message' : 'search', label })

export const configure = (
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
