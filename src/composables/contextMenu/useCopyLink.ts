import { Ref } from 'vue'
import useExecWithToast from './useExecWithToast'
import { embeddingOrigin } from '/@/lib/apis'
import { constructMessagesPath } from '/@/router'
import { MessageId } from '/@/types/entity-ids'

const useCopyLink = (messageId: Ref<MessageId>) => {
  const { execWithToast } = useExecWithToast()

  const copy = async (link: string) => {
    await execWithToast('コピーしました', 'コピーに失敗しました', () =>
      navigator.clipboard.writeText(link)
    )
  }

  const copyLink = async () => {
    const link = `${embeddingOrigin}${constructMessagesPath(messageId.value)}`
    await copy(link)
  }

  const copyEmbedded = async () => {
    const link = `<iframe src="${embeddingOrigin}/widget/?type=message&id=${messageId.value}" scrolling="no" frameborder="no" width="600"></iframe>`
    await copy(link)
  }

  return { copyLink, copyEmbedded }
}

export default useCopyLink
