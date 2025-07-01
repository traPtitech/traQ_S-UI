import type { Ref } from 'vue'
import useCopyText from '/@/composables/toast/useCopyText'
import { embeddingOrigin } from '/@/lib/apis'
import { constructMessagesPath } from '/@/router'
import type { MessageId } from '/@/types/entity-ids'

const useCopyLink = (messageId: Ref<MessageId>) => {
  const { copyText } = useCopyText()

  const copyLink = async () => {
    const link = `${embeddingOrigin}${constructMessagesPath(messageId.value)}`
    await copyText(link, 'メッセージリンク')
  }

  const copyEmbedded = async () => {
    const link = `<iframe src="${embeddingOrigin}/widget/?type=message&id=${messageId.value}" scrolling="no" frameborder="no" width="600"></iframe>`
    await copyText(link, '埋め込み')
  }

  return { copyLink, copyEmbedded }
}

export default useCopyLink
