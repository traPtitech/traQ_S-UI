import type { EmbeddingOrUrl, ExternalUrl } from '@traptitech/traq-markdown-it'
import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref } from 'vue'
import { isExternalUrl, isFile, isMessage } from '/@/lib/guard/embeddingOrUrl'
import { render } from '/@/lib/markdown/markdown'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import type { ChannelId, MessageId } from '/@/types/entity-ids'
import { useMessagesStore } from '/@/store/entities/messages'

export interface messageIdWithSpecifiedDate {
  lastWeek: string | null
  lastMonth: string | null
  first: string | null
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

/**
 * メッセージの表示に必要な情報を取得したりパースしたりする
 */
const useMessagesViewPinia = defineStore('domain/messagesView', () => {
  const messagesStore = useMessagesStore()

  const renderedContentMap = ref(new Map<MessageId, string>())
  const embeddingsMap = ref(new Map<MessageId, EmbeddingOrUrl[]>())

  const messageIdsWithSpecifiedDateMap = ref(
    new Map<ChannelId, messageIdWithSpecifiedDate>()
  )

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

  const resetRenderedContent = () => {
    renderedContentMap.value.clear()
    embeddingsMap.value.clear()
  }

  return {
    renderedContentMap,
    embeddingsMap,
    messageIdsWithSpecifiedDateMap,
    renderMessageContent,
    resetRenderedContent
  }
})

export const useMessagesView = convertToRefsStore(useMessagesViewPinia)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMessagesViewPinia, import.meta.hot))
}
