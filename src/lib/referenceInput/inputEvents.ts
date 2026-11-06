import type { EditorProps } from '@tiptap/pm/view'

import type { MarkdownLineBreakOptions } from './markdownLineBreak'
import { syncInputSelection } from './selection'

type Options = {
  isIOS: boolean
  isComposing: () => boolean
  isCompositionKeyEvent: (event: KeyboardEvent) => boolean
  handleKeyAction: (event: KeyboardEvent) => boolean
  insertLineBreak: (options: MarkdownLineBreakOptions) => void
  startComposition: () => void
  endComposition: () => void
  hideSuggestions: () => void
  onKeyUp: (event: KeyboardEvent) => void
  onBeforeInput: (event: InputEvent) => void
}

export const createInputEventHandlers = (
  options: Options
): Pick<EditorProps, 'handleKeyDown' | 'handleDOMEvents'> => {
  const iOSFlag = options.isIOS
  let pendingIOSEnter: KeyboardEvent | undefined

  return {
    handleKeyDown: (_view, event) => {
      if (options.isCompositionKeyEvent(event)) return false

      if (options.handleKeyAction(event)) return true

      if (event.key === 'Enter') {
        options.insertLineBreak({
          continueItem:
            event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey
        })

        return true
      }

      return false
    },

    handleDOMEvents: {
      blur: () => {
        pendingIOSEnter = undefined
        return false
      },

      keydown: (_view, event) => {
        pendingIOSEnter = undefined

        // IME の既定動作は許可し、ProseMirror の通常のキー処理だけを止める。
        if (options.isCompositionKeyEvent(event)) return true

        if (
          iOSFlag &&
          event.key === 'Enter' &&
          !event.ctrlKey &&
          !event.altKey &&
          !event.metaKey
        ) {
          // iOS の既定動作を許可し、Enter は続く beforeinput で一度だけ処理する。
          // ProseMirror の遅延 Enter 処理は登録させない。
          pendingIOSEnter = event

          return true
        }

        return false
      },

      compositionstart: () => {
        pendingIOSEnter = undefined
        options.startComposition()
        options.hideSuggestions()

        return false
      },

      compositionend: () => {
        options.endComposition()

        return false
      },

      keyup: (_view, event) => {
        pendingIOSEnter = undefined
        options.onKeyUp(event)

        return false
      },

      beforeinput: (view, event) => {
        const enter = pendingIOSEnter
        pendingIOSEnter = undefined

        if (options.isComposing() || event.isComposing || !event.cancelable)
          return false

        options.onBeforeInput(event)

        if (event.defaultPrevented) return true

        if (
          event.inputType === 'insertParagraph' ||
          event.inputType === 'insertLineBreak'
        ) {
          event.preventDefault()

          syncInputSelection(view)

          if (enter && options.handleKeyAction(enter)) return true

          options.insertLineBreak({
            continueItem: event.inputType === 'insertLineBreak'
          })

          return true
        }

        return false
      }
    }
  }
}
