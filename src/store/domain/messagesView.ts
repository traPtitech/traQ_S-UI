import { EmbeddingOrUrl, ExternalUrl } from '@traptitech/traq-markdown-it'
import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref } from 'vue'
import apis from '/@/lib/apis'
import { isExternalUrl, isFile, isMessage } from '/@/lib/guard/embeddingOrUrl'
import { render } from '/@/lib/markdown/markdown'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import { MessageId } from '/@/types/entity-ids'
import { useMessagesStore } from '/@/store/entities/messages'

export type LoadingDirection = 'former' | 'latter' | 'around' | 'latest'
interface BaseGetMessagesParams {
  limit?: number
  offset?: number
  since?: Date
  until?: Date
  inclusive?: boolean
  order?: 'asc' | 'desc'
}
interface GetMessagesParams extends BaseGetMessagesParams {
  channelId: string
}

interface GetFilesChannelParams {
  channelId: string
  limit?: number
  offset?: number
  since?: Date
  until?: Date
  inclusive?: boolean
  order?: 'asc' | 'desc'
  mine?: boolean
}

interface GetClipsParam {
  folderId: string
  limit?: number
  offset?: number
  order?: 'asc' | 'desc'
}

interface GetDirectMessagesParams extends BaseGetMessagesParams {
  userId: string
}

const ignoredHostNamesSet = new Set<string>(
  window.traQConfig.ogpIgnoreHostNames
)

const isIncludedHost = (url: ExternalUrl) => {
  try {
    const hostName = new URL(url.url).hostname
    return !ignoredHostNamesSet.has(hostName)
  } catch {
    return false // 不正なURL
  }
}

// FIXME: 分離
const useMessagesViewPinia = defineStore('domain/messagesView', () => {
  const messagesStore = useMessagesStore()

  const renderedContentMap = ref(new Map<MessageId, string>())
  const embeddingsMap = ref(new Map<MessageId, EmbeddingOrUrl[]>())

  const resetViewState = () => {
    renderedContentMap.value = new Map()
  }

  const fetchMessagesInClipFolder = async (params: GetClipsParam) => {
    const { data, headers } = await apis.getClips(
      params.folderId,
      params.limit,
      params.offset,
      params.order
    )
    messagesStore.extendMessagesMap(data.map(c => c.message))
    return {
      clips: data,
      hasMore: headers['x-traq-more'] === 'true'
    }
  }

  const fetchMessagesByChannelId = async (params: GetMessagesParams) => {
    const res = await apis.getMessages(
      params.channelId,
      params.limit,
      params.offset,
      params.since?.toISOString(),
      params.until?.toISOString(),
      params.inclusive,
      params.order
    )
    messagesStore.extendMessagesMap(res.data)
    return {
      messages: res.data,
      hasMore: res.headers['x-traq-more'] === 'true'
    }
  }

  const renderMessageContent = async (messageId: string) => {
    const content =
      messagesStore.messagesMap.value.get(messageId)?.content ?? ''

    const rendered = await render(content)

    const filePromises = rendered.embeddings.filter(isFile).map(async e => {
      try {
        await messagesStore.fetchFileMetaData({
          fileId: e.id
        })
      } catch {
        // TODO: エラー処理、無効な埋め込みの扱いを考える必要あり
      }
    })
    const messagePromises = rendered.embeddings
      .filter(isMessage)
      .map(async e => {
        try {
          const message = await messagesStore.fetchMessage({
            messageId: e.id
          })

          // テキスト部分のみレンダリング
          const rendered = await render(message.content)
          renderedContentMap.value.set(message.id, rendered.renderedText)
        } catch {
          // TODO: エラー処理、無効な埋め込みの扱いを考える必要あり
        }
      })
    const urlPromises = rendered.embeddings
      .filter(isExternalUrl)
      .filter(isIncludedHost)
      .slice(0, 2) // OGPが得られるかにかかわらず2個に制限
      .map(async e => {
        try {
          await messagesStore.fetchOgpData({
            url: e.url
          })
        } catch {
          // TODO: エラー処理、無効な埋め込みの扱いを考える必要あり
        }
      })

    await Promise.all([...filePromises, ...messagePromises, ...urlPromises])

    renderedContentMap.value.set(messageId, rendered.renderedText)
    embeddingsMap.value.set(messageId, rendered.embeddings)
  }

  return {
    renderedContentMap,
    embeddingsMap,
    resetViewState,
    fetchMessagesByChannelId,
    fetchMessagesInClipFolder,
    renderMessageContent
  }
})

export const useMessagesView = convertToRefsStore(useMessagesViewPinia)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMessagesViewPinia, import.meta.hot))
}
