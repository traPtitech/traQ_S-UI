import { useOpenLink } from '/@/use/openLink'
import { useModalStore } from '/@/store/ui/modal'

export const useOpenLinkAndClearModal = () => {
  const { clearModal } = useModalStore()
  const { openLink } = useOpenLink()

  /**
   * 引数のlinkが実体になっていることが重要。
   * refになっていた場合は、モーダルを削除したときにundefinedになってしまっている場合が起こりうる。
   */
  const openLinkAndClearModal = (event: MouseEvent, link: string) => {
    openLink(event, link, async () => {
      await clearModal()
    })
  }

  return { openLinkAndClearModal }
}
