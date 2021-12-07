import { useRouter } from 'vue-router'
import { isMac } from '/@/lib/dom/browser'

const LEFT_CLICK_BUTTON = 0
const MIDDLE_CLICK_BUTTON = 1

const macFlag = isMac()

export const useOpenLink = () => {
  const router = useRouter()

  /**
   * macなら⌘(Command)キーが押されている、そうでないならCtrlキーが押されているかどうか
   */
  const isCtrlOrCommandKey = (e: MouseEvent) =>
    (!macFlag && e.ctrlKey) || (macFlag && e.metaKey)

  /**
   * 参考: https://github.com/vuejs/vue-router-next/blob/07b34816e2b29d77fec622d79084530eb716abf3/src/RouterLink.ts#L267-L285
   */
  const shouldOpenWithRouter = (e: MouseEvent) => {
    // 修飾キーがあるものは無視
    if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) return false
    // 左クリックでないものは無視
    if (e.button !== undefined && e.button !== LEFT_CLICK_BUTTON) return false
    return true
  }

  const shouldOpenWithNewTab = (e: MouseEvent) =>
    !shouldOpenWithRouter(e) &&
    (e.button === MIDDLE_CLICK_BUTTON ||
      (e.button === LEFT_CLICK_BUTTON && isCtrlOrCommandKey(e)))

  /**
   * 中クリックやCtrlクリックでは別タブで開くようにする
   * onClickでは左クリックでしか発火しないので、onMouseDownを利用すること
   *
   * 中クリックやCtrlクリックでの別タブを開くのはバックグラウンドで開くのに対して、
   * この関数ではフォアグラウンドで開く(タブが切り替わる)ので、
   * できる限りは<router-link>などによってaタグのhref属性を利用するようにすること
   *
   * @param link originを含まない絶対パス
   * @example
   * open(e, `/messages/${message.id}`)
   */
  const openLink = async (
    event: MouseEvent,
    link: string,
    beforeOpenWithRouter?: () => void | Promise<void>
  ) => {
    if (shouldOpenWithRouter(event)) {
      event.preventDefault()

      if (event.isTrusted) {
        // 下のrouter.pushによって、targetの要素が消える場合に、
        // clickイベントが発火しないのでここで発火させる
        // 無限ループを防止するためにブラウザで発火したもの以外は無視する
        event.target?.dispatchEvent(new MouseEvent('click', event))
      }

      await beforeOpenWithRouter?.()
      router.push(link)
    } else if (shouldOpenWithNewTab(event)) {
      event.preventDefault()

      open(link, '_blank', 'noopener')
    }
  }

  return { shouldOpenWithRouter, shouldOpenWithNewTab, openLink }
}
