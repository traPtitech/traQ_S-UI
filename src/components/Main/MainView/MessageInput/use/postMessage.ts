import { TextState } from './textInput'
import { ChannelId } from '@/types/entity-ids'
import store from '@/store'
import api, { buildFilePathForPost } from '@/lib/api'

const usePostMessage = (
  textState: TextState,
  props: { channelId: ChannelId }
) => {
  const postMessage = async () => {
    if (textState.text.length === 0) return
    const attachments = store.state.ui.fileInput.attachments
    try {
      const responses = await Promise.all(
        attachments.map(attachment =>
          api.postFile(attachment.file, props.channelId)
        )
      )
      const fileUrls = responses.map(res => buildFilePathForPost(res.data.id))
      const embededdUrls = fileUrls.join('\n')
      await api.postMessage(props.channelId, {
        content: textState.text + '\n' + embededdUrls
      })
      textState.text = ''
      store.commit.ui.fileInput.clearAttachments()
    } catch {
      // TODO: エラー処理
    }
  }
  return postMessage
}

export default usePostMessage
