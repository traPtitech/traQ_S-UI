import {
  createSharedComposable,
  useEventListener,
  useTimeout
} from '@vueuse/core'

import { isComposingKeyEvent } from '/@/lib/dom/keyboard'

const shortcutKeys = new Set([
  'Tab',
  'Escape',
  'Shift',
  'Control',
  'Alt',
  'Meta'
])

const useRecentKeyboardInput = createSharedComposable(() => {
  const hasTouchInput = navigator.maxTouchPoints > 0
  const { isPending, start, stop } = useTimeout(15_000, {
    controls: true,
    immediate: false
  })

  useEventListener(
    'keydown',
    event => {
      if (!event.isTrusted || isComposingKeyEvent(event)) return

      const { key, code } = event
      const shortcutKey = key.startsWith('Arrow') || shortcutKeys.has(key)

      // タッチ端末のソフトキーボードも文字や編集キーの code を送ることがある。
      const identifiedKey =
        !hasTouchInput && code !== '' && code !== 'Unidentified'

      if (shortcutKey || identifiedKey) start()
    },
    { capture: true }
  )

  useEventListener(
    'pointerdown',
    event => {
      if (event.isTrusted && ['touch', 'pen'].includes(event.pointerType))
        stop()
    },
    { capture: true }
  )

  return isPending
})

export default useRecentKeyboardInput
