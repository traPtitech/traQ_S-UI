import { ref } from 'vue'

import type { Editor } from '@tiptap/core'
import { useEventListener } from '@vueuse/core'

import { isIOS } from '/@/lib/dom/browser'
import {
  type SuggestionTarget,
  isStampSuggestion
} from '/@/lib/referenceInput/suggestion'

type Options = {
  editor: () => Editor | undefined
  target: () => SuggestionTarget | undefined
  shown: () => boolean
}

const CARET_GAP = 8

export const useSuggestionPosition = (options: Options) => {
  const iOSFlag = isIOS()
  const position = ref({ top: 0, left: 0 })

  const updatePosition = (keepHorizontal = false) => {
    const editor = options.editor()
    const current = options.target()
    if (!editor || editor.isDestroyed || !options.shown() || !current) return

    const stamp = isStampSuggestion(current)
    const { view } = editor
    const start = view.coordsAtPos(current.from, -1)
    const top = current.mode === 'search' ? start.bottom : start.top

    position.value = {
      top:
        (stamp
          ? Math.min(top, view.coordsAtPos(current.to, -1).top) - CARET_GAP
          : top) + (iOSFlag ? (window.visualViewport?.offsetTop ?? 0) : 0),
      left: keepHorizontal ? position.value.left : start.left
    }
  }

  const reposition = () => updatePosition()
  useEventListener(document, 'scroll', reposition, {
    capture: true,
    passive: true
  })
  useEventListener(window, 'resize', reposition, { passive: true })
  useEventListener(window.visualViewport, ['resize', 'scroll'], reposition, {
    passive: true
  })

  return { position, updatePosition }
}
