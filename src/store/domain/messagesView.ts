import { ChannelViewer, ChannelViewState, Message, Pin } from '@traptitech/traq'
import { EmbeddingOrUrl, ExternalUrl } from '@traptitech/traq-markdown-it'
import { defineStore, acceptHMRUpdate } from 'pinia'
import { computed, ref } from 'vue'
import apis from '/@/lib/apis'
import { createSingleflight } from '/@/lib/basic/async'
import { isExternalUrl, isFile, isMessage } from '/@/lib/guard/embeddingOrUrl'
import { render } from '/@/lib/markdown/markdown'
import { changeViewState, wsListener } from '/@/lib/websocket'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import { ChannelId, ClipFolderId, MessageId } from '/@/types/entity-ids'
import { messageMitt, useMessagesStore } from '/@/store/entities/messages'
import { useMeStore } from '/@/store/domain/me'

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

const getPin = createSingleflight(apis.getPin.bind(apis))

// FIXME: 分離
const useMessagesViewPinia = defineStore('domain/messagesView', () => {
  const meStore = useMeStore()
  const messagesStore = useMessagesStore()

  /** 現在のチャンネルID、日時ベースのフェッチを行う */
  const currentChannelId = ref<ChannelId>()
  /** 現在のクリップフォルダID、オフセットベースのフェッチを行う */
  const currentClipFolderId = ref<ClipFolderId>()
  const pinnedMessages = ref<Pin[]>([])
  /**
   * 最新のメッセージを受信する状態かどうか
   *
   * `isReachedLatest`と同期する必要がある
   */
  const receiveLatestMessages = ref(false)
  const renderedContentMap = ref(new Map<MessageId, string>())
  const embeddingsMap = ref(new Map<MessageId, EmbeddingOrUrl[]>())
  /** チャンネルを見ている人の一覧(古い順) */
  const currentViewers = ref<ChannelViewer[]>([])
  /** 現在編集中のメッセージID */
  const editingMessageId = ref<MessageId>()

  /**
   * チャンネルを見ている人(入力中も含む)のIDの一覧(古い順)
   */
  const viewingUsers = computed(() =>
    currentViewers.value
      .filter(
        v => v.state === ChannelViewState.Monitoring || ChannelViewState.Editing
      )
      .map(v => v.userId)
  )

  /**
   * チャンネルで入力中の人のIDの一覧(新しい順)
   */
  const typingUsers = computed(() => {
    const myId = meStore.myId.value
    return currentViewers.value
      .filter(v => v.state === ChannelViewState.Editing && v.userId !== myId)
      .map(v => v.userId)
      .reverse()
  })

  const addPinnedMessage = (message: Pin) => {
    pinnedMessages.value.push(message)
  }
  const updatePinnedMessage = (message: Message) => {
    const index = pinnedMessages.value.findIndex(
      element => element.message.id === message.id
    )
    if (index > -1) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      pinnedMessages.value[index]!.message = message
    }
  }
  const removePinnedMessage = (messageId: MessageId) => {
    const index = pinnedMessages.value.findIndex(
      element => element.message.id === messageId
    )
    if (index > -1) {
      pinnedMessages.value.splice(index, 1)
    }
  }

  const resetViewState = () => {
    currentChannelId.value = undefined
    currentClipFolderId.value = undefined
    pinnedMessages.value = []
    renderedContentMap.value = new Map()
    currentViewers.value = []
  }

  const changeCurrentChannel = (payload: {
    channelId: ChannelId
    entryMessageId?: MessageId
    isDM?: boolean
  }) => {
    if (currentChannelId.value === payload.channelId) return

    // ここの二行は同時に実行されないとmessagesFetcherのrunWithIdentifierCheckに失敗する
    resetViewState()
    currentChannelId.value = payload.channelId

    fetchPinnedMessages()
  }

  /** クリップフォルダに移行 */
  const changeCurrentClipFolder = (clipFolderId: ClipFolderId) => {
    if (currentClipFolderId.value === clipFolderId) return

    // ここの二行は同時に実行されないとmessagesFetcherのrunWithIdentifierCheckに失敗する
    resetViewState()
    currentClipFolderId.value = clipFolderId
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

  const fetchPinnedMessages = async () => {
    if (!currentChannelId.value) throw 'no channel id'
    const res = await apis.getChannelPins(currentChannelId.value)
    pinnedMessages.value = res.data
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

  const updateAndRenderMessageId = async (message: Message) => {
    await renderMessageContent(message.id)
  }

  const syncViewState = () => {
    if (currentChannelId.value) {
      changeViewState(
        currentChannelId.value,
        receiveLatestMessages.value
          ? ChannelViewState.Monitoring
          : ChannelViewState.None
      )
    } else {
      changeViewState(null)
    }
  }

  wsListener.on('CHANNEL_VIEWERS_CHANGED', ({ viewers }) => {
    currentViewers.value = viewers
  })
  // 再接続時の再取得はmessagesFetcherで行う

  messageMitt.on('updateMessage', async message => {
    if (currentChannelId.value !== message.channelId) return
    updatePinnedMessage(message)
    await updateAndRenderMessageId(message)
  })
  messageMitt.on('deleteMessage', messageId => {
    removePinnedMessage(messageId)
  })
  messageMitt.on('changeMessagePinned', async ({ message, pinned }) => {
    if (currentChannelId.value !== message.channelId) return

    if (!pinned) {
      removePinnedMessage(message.id)
      return
    }

    const [{ data: pin }, shared] = await getPin(message.id)
    if (shared) return

    addPinnedMessage({
      userId: pin.userId,
      message,
      pinnedAt: pin.pinnedAt
    })
  })

  return {
    currentChannelId,
    currentClipFolderId,
    editingMessageId,
    pinnedMessages,
    renderedContentMap,
    embeddingsMap,
    receiveLatestMessages,
    viewingUsers,
    typingUsers,
    fetchMessagesByChannelId,
    fetchMessagesInClipFolder,
    renderMessageContent,
    syncViewState,
    changeCurrentChannel,
    changeCurrentClipFolder
  }
})

export const useMessagesView = convertToRefsStore(useMessagesViewPinia)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMessagesViewPinia, import.meta.hot))
}
