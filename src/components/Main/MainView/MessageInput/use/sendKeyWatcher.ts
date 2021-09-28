import {
  checkLevel2InputEventsSupport,
  isMac,
  isTouchDevice
} from '/@/lib/util/browser'
import store from '/@/store'
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
  const { alt, ctrl, shift, macCtrl } =
    store.state.app.browserSettings.modifierKey

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

/**
 * 改行の挿入のイベントであり、送信する必要があるかどうか
 * (タッチ端末では無視する)
 *
 * 修飾キーなしで送信の設定の際に、送信が必要かの判定で利用
 */
const isSendKeyInput = (inputEvent: InputEvent) => {
  return (
    store.state.app.browserSettings.sendWithModifierKey === 'none' &&
    inputEvent.inputType === 'insertLineBreak'
  )
}

/**
 * 修飾キーを押した状態での改行で、それによって改行を挿入する必要があるかどうか
 * 修飾キーなしでの改行はデフォルトのものを利用
 *
 * 修飾キーなしで送信の設定の際に、改行の挿入が必要かの判定で利用
 */
const needBreakLineInsert = (keyEvent: KeyboardEvent) => {
  return (
    store.state.app.browserSettings.sendWithModifierKey === 'none' &&
    keyEvent.key === 'Enter' &&
    withModifierKey(keyEvent) &&
    !keyEvent.isComposing
  )
}

/**
 * contextに対して発火されるイベント
 * - `postMessage`: 投稿トリガー時
 * - `modifierKeyDown`: 修飾キーが押された
 * - `modifierKeyUp`: 修飾キーが離された
 */
const useSendKeyWatcher = (
  emit: ((event: 'postMessage') => void) &
    ((event: 'modifierKeyDown') => void) &
    ((event: 'modifierKeyUp') => void),
  insertLineBreak: () => void
) => {
  /*
   * 修飾キーが押されている際は先に発火する`keydown`イベントで
   * 既にpreventされているため`beforeinput`イベントは発火しない
   * したがって、これが発火したときは修飾キーが押されていないことが保障されている
   */
  const onBeforeInput = (event: InputEvent) => {
    if (!touchDeviceFlag && isSendKeyInput(event)) {
      event.preventDefault()
      emit('postMessage')
    }
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (touchDeviceFlag) return

    if (withModifierKey(event) && !event.isComposing) {
      emit('modifierKeyDown')
    }

    // https://github.com/traPtitech/traQ_R-UI/pull/945
    if (event.key === 'Enter' && !event.isComposing) {
      const { sendWithModifierKey } = store.state.app.browserSettings

      /*
       * 修飾キーありで送信の設定の際に、送信が必要かの判定
       *
       * TODO: ここでSafariの場合、
       *       変換確定のEnterでもこの分岐に入ってしまうため、
       *       下と同じような処理をする必要がある
       *       refs https://github.com/traPtitech/traQ_R-UI/pull/945#issuecomment-509942373
       */
      if (sendWithModifierKey === 'modifier' && withModifierKey(event)) {
        event.preventDefault()
        emit('postMessage')
        return
      }

      /*
       * 修飾キーなしで送信の設定の際に、
       * `beforeinput`イベントに対応していないブラウザの場合、
       * 送信が必要かの判定
       *
       * `beforeinput`イベントが利用できる場合はここで処理しない
       * Safari出ない場合はここで処理を行ってもよいが、
       * Safariの場合は変換確定のEnterでの`keydown`イベントの
       * isComposingがfalseなので、変換確定でも送信がされてしまうため、
       * `beforeinput`で判定を行うようにする
       */
      if (
        sendWithModifierKey === 'none' &&
        !withModifierKey(event) &&
        !isLevel2InputEventsSupported
      ) {
        event.preventDefault()
        emit('postMessage')
        return
      }
    }

    if (needBreakLineInsert(event)) {
      event.preventDefault()
      insertLineBreak()
    }
  }

  const onKeyUp = (event: KeyboardEvent) => {
    if (!touchDeviceFlag && isModifierKey(event)) {
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
