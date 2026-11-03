import type { EditorView } from '@tiptap/pm/view'
import { useTimeoutFn } from '@vueuse/core'

import { isComposingInput } from '/@/lib/referenceInput/composition'

export default function useInputComposition(options: {
  view: () => EditorView | undefined
  onSettled: () => void
}) {
  let pending = false
  let endedAt = -Infinity

  // DOM の取り込みが終わるまで、compositionend 後も編集コマンドを抑止する。
  const { start: settle, stop } = useTimeoutFn(
    () => {
      pending = false
      options.onSettled()
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
    composingEvent: (event: KeyboardEvent) =>
      isComposingInput(
        options.view() ?? { composing: false },
        event,
        () => pending
      ) ||
      (event.key === 'Enter' && performance.now() - endedAt < 50),

    start: () => {
      stop()
      pending = true
    },

    end: () => {
      endedAt = performance.now()
      settle()
    }
  }
}
