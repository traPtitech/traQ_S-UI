import { SetupContext, reactive } from '@vue/composition-api'
import {
  checkLevel2InputEventsSupport,
  isMac,
  isTouchDevice
} from '@/lib/util/browser'

import store from '@/store'

const isLevel2InputEventsSupported = checkLevel2InputEventsSupport()
const macFlag = isMac()
const touchDeviceFlag = isTouchDevice()

interface ModifierKeys {
  altKey?: boolean
  ctrlKey?: boolean
  shiftKey?: boolean
  metaKey?: boolean
}

const hasModifierKey = (keys: ModifierKeys) => {
  const {
    alt,
    ctrl,
    shift,
    macCtrl
  } = store.state.app.browserSettings.modifierKey

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

const isModifierKey = (keyEvent: KeyboardEvent) => {
  switch (keyEvent.key) {
    case 'Alt':
      return hasModifierKey({ altKey: true })
    case 'Meta':
      return hasModifierKey({ metaKey: true })
    case 'Shift':
      return hasModifierKey({ shiftKey: true })
    case 'Control':
      return hasModifierKey({ ctrlKey: true })
  }
  return false
}

const withModifierKey = (keyEvent: KeyboardEvent) => {
  return hasModifierKey(keyEvent)
}

const isSendKeyInput = (inputEvent: InputEvent) => {
  // modifierが押されているときはisBRKey()を利用してpreventされる
  return (
    store.state.app.browserSettings.sendWithModifierKey === 'none' &&
    inputEvent.inputType === 'insertLineBreak' &&
    !touchDeviceFlag
  )
}
const isBRKey = (keyEvent: KeyboardEvent) => {
  return (
    store.state.app.browserSettings.sendWithModifierKey === 'none' &&
    keyEvent.key === 'Enter' &&
    withModifierKey(keyEvent)
  )
}

const useSendKeyWatcher = (
  context: SetupContext,
  sendEventName: string,
  modifierKeyDownEventName: string,
  modifierKeyUpEventName: string,
  insertLineBreak: () => void
) => {
  const state = reactive({
    isModifierKeyPressed: false
  })

  const onBeforeInput = (event: InputEvent) => {
    if (isSendKeyInput(event)) {
      event.preventDefault()
      context.emit(sendEventName)
    }
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (withModifierKey(event) && !event.isComposing) {
      context.emit(modifierKeyDownEventName)
    }

    // https://github.com/traPtitech/traQ_R-UI/pull/945
    if (event.key === 'Enter' && !event.isComposing) {
      const { sendWithModifierKey } = store.state.app.browserSettings

      if (sendWithModifierKey === 'modifier' && withModifierKey(event)) {
        event.preventDefault()
        context.emit(sendEventName)
        return
      }

      if (
        sendWithModifierKey === 'none' &&
        !withModifierKey(event) &&
        !isLevel2InputEventsSupported
      ) {
        event.preventDefault()
        context.emit(sendEventName)
        return
      }
    }

    if (isBRKey(event) && !event.isComposing) {
      event.preventDefault()
      insertLineBreak()
    }
  }

  const onKeyUp = (event: KeyboardEvent) => {
    if (isModifierKey(event)) {
      context.emit(modifierKeyUpEventName)
    }
  }

  return {
    sendKeyState: state,
    onBeforeInput,
    onKeyDown,
    onKeyUp
  }
}

export default useSendKeyWatcher
