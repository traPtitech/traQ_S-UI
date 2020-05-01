import { TextState } from './textInput'
import { ChannelId } from '@/types/entity-ids'
import store from '@/store'
import apis, { buildFilePathForPost } from '@/lib/apis'
import { Attachment } from '@/store/ui/fileInput/state'
import { replace as embedInternalLink } from '@/lib/internalLinkEmbedder'
import useChannelPath from '@/use/channelPath'
import { ref } from '@vue/composition-api'

const uploadAttachments = async (
  attachments: Attachment[],
  channelId: ChannelId
) => {
  const responses = await Promise.all(
    attachments.map(attachment => apis.postFile(attachment.file, channelId))
  )
  return responses.map(res => buildFilePathForPost(res.data.id))
}

const usePostMessage = (
  textState: TextState,
  props: { channelId: ChannelId }
) => {
  const { channelPathToId } = useChannelPath()

  const isPosting = ref(false)

  const postMessage = async () => {
    if (isPosting.value) return
    if (textState.isEmpty && store.getters.ui.fileInput.isEmpty) return

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

      isPosting.value = true
      await apis.postMessage(props.channelId, {
        content: embededText + '\n' + embededdUrls
      })
    } catch {
      // TODO: エラー処理
    } finally {
      textState.text = ''
      store.commit.ui.fileInput.clearAttachments()

      isPosting.value = false
    }
  }
  return { postMessage, isPosting }
}

export default usePostMessage
