import type { EmbeddingOrUrl, ExternalUrl } from '@traptitech/traq-markdown-it'

import { ref } from 'vue'

import { acceptHMRUpdate, defineStore } from 'pinia'

import useAsyncScope from '/@/composables/utils/useAsyncScope'
import { isExternalUrl, isFile, isMessage } from '/@/lib/guard/embeddingOrUrl'
import { render } from '/@/lib/markdown/markdown'
import { useMessagesStore } from '/@/store/entities/messages'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import type { MessageId } from '/@/types/entity-ids'

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
  const scope = useAsyncScope()

  const renderedContentMap = ref(new Map<MessageId, string>())
  const embeddingsMap = ref(new Map<MessageId, EmbeddingOrUrl[]>())

  const cacheRenderedContent = (
    messageId: MessageId,
    content: string,
    rendered: Awaited<ReturnType<typeof render>>,
    isCurrent: () => boolean
  ) => {
    if (
      !isCurrent() ||
      messagesStore.messagesMap.value.get(messageId)?.content !== content
    )
      return

    renderedContentMap.value.set(messageId, rendered.renderedText)
    embeddingsMap.value.set(messageId, rendered.embeddings)
  }

  const renderLatestContent = async (
    messageId: MessageId,
    isActive: () => boolean,
    prepare?: (rendered: Awaited<ReturnType<typeof render>>) => Promise<void>
  ) => {
    if (!isActive()) return

    await messagesStore.fetchMessage({ messageId })

    // 同じ画面の描画中に本文が更新された場合は、最新の本文でやり直す。
    while (isActive()) {
      const message = messagesStore.messagesMap.value.get(messageId)
      if (!message) return

      const content = message.content
      const rendered = await render(content)
      if (!isActive()) return

      if (messagesStore.messagesMap.value.get(messageId)?.content !== content)
        continue

      await prepare?.(rendered)
      if (!isActive()) return

      if (messagesStore.messagesMap.value.get(messageId)?.content !== content)
        continue

      cacheRenderedContent(messageId, content, rendered, isActive)

      return
    }
  }

  const prepareEmbeddings = async (
    rendered: Awaited<ReturnType<typeof render>>,
    isActive: () => boolean
  ) => {
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
          await renderLatestContent(e.id, isActive)
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
  }

  const renderMessageContent = (
    messageId: MessageId,
    isCurrent: () => boolean = () => true
  ) => {
    const isScopeCurrent = scope.capture()
    const isActive = () => isScopeCurrent() && isCurrent()

    return renderLatestContent(messageId, isActive, rendered =>
      prepareEmbeddings(rendered, isActive)
    )
  }

  const resetRenderedContent = () => {
    scope.invalidate()
    renderedContentMap.value.clear()
    embeddingsMap.value.clear()
  }

  return {
    renderedContentMap,
    embeddingsMap,
    renderMessageContent,
    resetRenderedContent
  }
})

export const useMessagesView = convertToRefsStore(useMessagesViewPinia)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMessagesViewPinia, import.meta.hot))
}
