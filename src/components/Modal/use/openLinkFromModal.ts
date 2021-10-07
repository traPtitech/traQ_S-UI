import store from '/@/store'
import { useOpenLink } from '/@/use/openLink'

export const useOpenLinkAndClearModal = () => {
  const { openLink } = useOpenLink()

  /**
   * 引数のlinkが実体になっていることが重要。
   * refになっていた場合は、モーダルを削除したときにundefinedになってしまっている場合が起こりうる。
   */
  const openLinkAndClearModal = (event: MouseEvent, link: string) => {
    openLink(event, link, async () => {
      await store.dispatch.ui.modal.clearModal()
    })
  }

  return { openLinkAndClearModal }
}
