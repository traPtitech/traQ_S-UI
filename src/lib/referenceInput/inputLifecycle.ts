import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

export type InputLifecycle = {
  composing: boolean
  focused: boolean
  markdown: boolean
}

export const inputLifecycleKey = new PluginKey<InputLifecycle>('inputLifecycle')

export const inputLifecycleExtension = Extension.create({
  name: 'inputLifecycle',
  priority: 1000,

  addProseMirrorPlugins: () => [
    new Plugin<InputLifecycle>({
      key: inputLifecycleKey,
      state: {
        init: () => ({ composing: false, focused: false, markdown: false }),
        apply: (transaction, previous) => ({
          ...previous,
          ...(transaction.getMeta(inputLifecycleKey) as
            Partial<InputLifecycle> | undefined)
        })
      }
    })
  ]
})
