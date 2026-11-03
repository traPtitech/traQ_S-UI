import type { EditorView } from '@tiptap/pm/view'
import { useTimeoutFn } from '@vueuse/core'

import { isComposingInput } from '/@/lib/referenceInput/composition'

export default function useInputComposition(options: {
  view: () => EditorView | undefined
  onChange: (composing: boolean) => void
  onSettled: () => void
}) {
  let pending = false
  let endedAt = -Infinity
  let afterComposition: (() => void) | undefined

  // DOM の取り込みが終わるまで、compositionend 後も編集コマンドを抑止する。
  const { start: settle, stop } = useTimeoutFn(
    () => {
      pending = false
      options.onChange(false)
      options.onSettled()
      const action = afterComposition
      afterComposition = undefined
      action?.()
    },
    0,
    { immediate: false }
  )

  const isComposing = () =>
    isComposingInput(
      options.view() ?? { composing: false },
      undefined,
      () => pending
    )

  return {
    isComposing,
    finish: (action: () => void) => {
      if (!isComposing()) {
        action()

        return
      }

      afterComposition = action
      // ブラウザーに変換を確定させてから、候補の置換を行う。
      options.view()?.dom.blur()
    },
    isCompositionKeyEvent: (event: KeyboardEvent) =>
      isComposingInput(
        options.view() ?? { composing: false },
        event,
        () => pending
      ) ||
      (event.key === 'Enter' && performance.now() - endedAt < 50),

    start: () => {
      stop()
      afterComposition = undefined
      pending = true
      options.onChange(true)
    },

    end: () => {
      endedAt = performance.now()
      settle()
    }
  }
}
