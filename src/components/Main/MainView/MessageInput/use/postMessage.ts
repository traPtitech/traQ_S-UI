import { TextState } from './textInput'
import { ChannelId } from '@/types/entity-ids'
import store from '@/store'
import api, { buildFilePathForPost } from '@/lib/api'
import { Attachment } from '@/store/ui/fileInput/state'
import { replace as embedInternalLink } from '@/lib/internalLinkEmbedder'
import useChannelPath from '@/use/channelPath'

const uploadAttachments = async (
  attachments: Attachment[],
  channelId: ChannelId
) => {
  const responses = await Promise.all(
    attachments.map(attachment => api.postFile(attachment.file, channelId))
  )
  return responses.map(res => buildFilePathForPost(res.data.id))
}

const usePostMessage = (
  textState: TextState,
  props: { channelId: ChannelId }
) => {
  const { channelPathToId } = useChannelPath()

  const postMessage = async () => {
    if (textState.text.length === 0) return

    const embededText = embedInternalLink(textState.text, {
      getUser: store.getters.entities.userByName,
      getGroup: store.getters.entities.userGroupByName,
      getChannel: path => {
        try {
          const id = channelPathToId(
            path.split('/'),
            store.state.domain.channelTree.channelTree
          )
          return { id }
        } catch {
          return undefined
        }
      }
    })

    try {
      const fileUrls = await uploadAttachments(
        store.state.ui.fileInput.attachments,
        props.channelId
      )
      const embededdUrls = fileUrls.join('\n')

      await api.postMessage(props.channelId, {
        content: embededText + '\n' + embededdUrls
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
