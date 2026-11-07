import type { MarkdownLineBreakOptions } from '@traq-flavored-markdown/vue-editor'

import { isMac, isMobilePlatform } from '/@/lib/dom/browser'
import type { SendKey, SendKeys } from '/@/store/app/browserSettings'
import { useBrowserSettings } from '/@/store/app/browserSettings'

const macFlag = isMac()
const usesMobileSubmissionPolicy = isMobilePlatform()

interface ModifierKeys {
  altKey?: boolean
  ctrlKey?: boolean
  shiftKey?: boolean
  metaKey?: boolean
}

const hasModifierKey = (keys: ModifierKeys, settingsKeys: SendKeys) => {
  const { alt, ctrl, shift, macCtrl } = settingsKeys

  if (macFlag) {
    return (
      // ⌥(Option)
      (alt && keys.altKey) ||
      // ⌘(Command)
      (ctrl && keys.metaKey) ||
      (shift && keys.shiftKey) ||
      (macCtrl && keys.ctrlKey)
    )
  }

  return (
    (alt && keys.altKey) || (ctrl && keys.ctrlKey) || (shift && keys.shiftKey)
  )
}

const isModifierKey = (keyEvent: KeyboardEvent, settingsKeys: SendKeys) => {
  switch (keyEvent.key) {
    case 'Alt':
      return hasModifierKey({ altKey: true }, settingsKeys)
    case 'Meta':
      return hasModifierKey({ metaKey: true }, settingsKeys)
    case 'Shift':
      return hasModifierKey({ shiftKey: true }, settingsKeys)
    case 'Control':
      return hasModifierKey({ ctrlKey: true }, settingsKeys)
  }
  return false
}

const withModifierKey = (keyEvent: KeyboardEvent, settingsKeys: SendKeys) => {
  return hasModifierKey(keyEvent, settingsKeys)
}

const isSendKeyInput = (
  inputEvent: InputEvent,
  sendWithModifierKey: SendKey
) => {
  return (
    sendWithModifierKey === 'none' &&
    !inputEvent.isComposing &&
    (inputEvent.inputType === 'insertLineBreak' ||
      inputEvent.inputType === 'insertParagraph')
  )
}

const needBreakLineInsert = (
  keyEvent: KeyboardEvent,
  sendWithModifierKey: SendKey,
  settingsModifierKeys: SendKeys
) => {
  return (
    sendWithModifierKey === 'none' &&
    keyEvent.key === 'Enter' &&
    withModifierKey(keyEvent, settingsModifierKeys) &&
    !keyEvent.isComposing
  )
}

const useSendKeyWatcher = (
  emit: ((event: 'postMessage') => void) &
    ((event: 'modifierKeyDown') => void) &
    ((event: 'modifierKeyUp') => void),
  insertLineBreak: (options?: MarkdownLineBreakOptions) => void
) => {
  const { sendWithModifierKey, modifierKey } = useBrowserSettings()

  const onBeforeInput = (event: Event) => {
    if (event instanceof InputEvent) {
      if (
        !usesMobileSubmissionPolicy &&
        isSendKeyInput(event, sendWithModifierKey.value)
      ) {
        event.preventDefault()
        emit('postMessage')
      }
    }
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (usesMobileSubmissionPolicy || event.isComposing) return

    const modifierPressed = withModifierKey(event, modifierKey.value)
    if (modifierPressed) emit('modifierKeyDown')

    if (event.key === 'Enter') {
      if (sendWithModifierKey.value === 'modifier' && modifierPressed) {
        event.preventDefault()
        emit('postMessage')
        return
      }

      if (sendWithModifierKey.value === 'none' && !modifierPressed) {
        event.preventDefault()
        emit('postMessage')

        return
      }
    }

    if (
      needBreakLineInsert(event, sendWithModifierKey.value, modifierKey.value)
    ) {
      event.preventDefault()
      insertLineBreak()
    }
  }

  const onKeyUp = (event: KeyboardEvent) => {
    if (
      !usesMobileSubmissionPolicy &&
      isModifierKey(event, modifierKey.value)
    ) {
      emit('modifierKeyUp')
    }
  }

  const onBlur = () => {
    emit('modifierKeyUp')
  }

  return {
    onBeforeInput,
    onKeyDown,
    onKeyUp,
    onBlur
  }
}

export default useSendKeyWatcher
