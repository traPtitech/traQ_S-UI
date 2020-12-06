import { TextState } from './textInput'
import { ChannelId } from '@/types/entity-ids'
import store from '@/store'
import apis, { buildFilePathForPost } from '@/lib/apis'
import { Attachment } from '@/store/ui/fileInput/state'
import { replace as embedInternalLink } from '@/lib/internalLinkEmbedder'
import useChannelPath from '@/use/channelPath'
import { computed, ref } from 'vue'
import { nullUuid } from '@/lib/util/uuid'
import { MESSAGE_MAX_LENGTH } from '@/lib/validate'

/**
 * @param progress アップロード進行状況 0～1
 */
type ProgressCallback = (progress: number) => void

const uploadAttachments = async (
  attachments: Attachment[],
  channelId: ChannelId,
  onProgress: ProgressCallback
) => {
  const responses = []
  for (const [i, attachment] of attachments.entries()) {
    responses.push(
      await apis.postFile(attachment.file, channelId, {
        /**
         * https://github.com/axios/axios#request-config
         */
        onUploadProgress(e: ProgressEvent) {
          onProgress((i + e.loaded / e.total) / attachments.length)
        }
      })
    )
  }
  return responses.map(res => buildFilePathForPost(res.data.id))
}

const createContent = (embededText: string, fileUrls: string[]) => {
  const embededUrls = fileUrls.join('\n')
  return embededText + (embededText && embededUrls ? '\n\n' : '') + embededUrls
}

const usePostMessage = (
  textState: Pick<TextState, 'text' | 'isEmpty'>,
  props: { channelId: ChannelId }
) => {
  const { channelPathToId, channelIdToShortPathString } = useChannelPath()

  const isForce = computed(
    () => store.state.entities.channels[props.channelId]?.force
  )
  const confirmString = computed(
    () =>
      `#${channelIdToShortPathString(
        props.channelId
      )}に投稿されたメッセージは全員に通知されます。メッセージを投稿しますか？`
  )

  const isPosting = ref(false)
  const progress = ref(0)

  const postMessage = async () => {
    if (isPosting.value) return false
    if (textState.isEmpty && store.getters.ui.fileInput.isEmpty) return false

    if (isForce.value && !confirm(confirmString.value)) {
      // 強制通知チャンネルでconfirmをキャンセルしたときは何もしない
      return false
    }

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

    const dummyFileUrls = store.state.ui.fileInput.attachments.map(() =>
      buildFilePathForPost(nullUuid)
    )
    const dummyText = createContent(embededText, dummyFileUrls)
    if (Array.from(dummyText).length > MESSAGE_MAX_LENGTH) {
      store.commit.ui.toast.addToast({
        type: 'error',
        text: 'メッセージが長すぎます'
      })
      return
    }

    let posted = false
    try {
      isPosting.value = true

      const fileUrls = await uploadAttachments(
        store.state.ui.fileInput.attachments,
        props.channelId,
        p => {
          progress.value = p
        }
      )

      await apis.postMessage(props.channelId, {
        content: createContent(embededText, fileUrls)
      })

      textState.text = ''
      store.commit.ui.fileInput.clearAttachments()
      posted = true
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('メッセージ送信に失敗しました', e)

      store.commit.ui.toast.addToast({
        type: 'error',
        text: 'メッセージ送信に失敗しました'
      })
    } finally {
      isPosting.value = false
      progress.value = 0
    }
    return posted
  }
  return { postMessage, isPosting, progress }
}

export default usePostMessage
