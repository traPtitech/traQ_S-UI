import type { FileInfo, Message, MessageStamp, Ogp } from '@traptitech/traq'
import type { AxiosError } from 'axios'
import mitt from 'mitt'
import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref } from 'vue'
import apis from '/@/lib/apis'
import { createSingleflight } from '/@/lib/basic/async'
import { wsListener } from '/@/lib/websocket'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import type { ExternalUrl, FileId, MessageId } from '/@/types/entity-ids'

type MessageEventMap = {
  reconnect: void
  addMessage: { message: Message; isCiting: boolean }
  updateMessage: Message
  deleteMessage: MessageId
  changeMessagePinned: { message: Message; pinned: boolean }
}

export const messageMitt = mitt<MessageEventMap>()

const getMessage = createSingleflight(apis.getMessage.bind(apis))
const getFileMeta = createSingleflight(apis.getFileMeta.bind(apis))
const getOgp = createSingleflight(apis.getOgp.bind(apis))

const useMessagesStorePinia = defineStore('entities/messages', () => {
  /**
   * ここでは内容が更新されることのみを保障する
   * それぞれの方でメッセージIDの追加、削除の更新はする必要がある
   */
  const messagesMap = ref(new Map<MessageId, Message>())
  const extendMessagesMap = (messages: Message[]) => {
    for (const message of messages) {
      messagesMap.value.set(message.id, message)
    }
  }
  const deleteMessage = (messageId: MessageId) => {
    messagesMap.value.delete(messageId)

    messageMitt.emit('deleteMessage', messageId)
  }
  const fetchMessage = async ({
    messageId,
    ignoreCache = false
  }: {
    messageId: MessageId
    ignoreCache?: boolean
  }) => {
    if (!ignoreCache && messagesMap.value.has(messageId)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return messagesMap.value.get(messageId)!
    }

    const [{ data: message }, shared] = await getMessage(messageId)
    if (!shared) {
      messagesMap.value.set(message.id, message)
    }
    return message
  }
  const updateMessageStamps = (
    messageId: MessageId,
    stamps: MessageStamp[]
  ) => {
    const message = messagesMap.value.get(messageId)
    if (!message) return
    message.stamps = stamps
  }
  const setMessagePinnedState = (messageId: MessageId, pinned: boolean) => {
    const message = messagesMap.value.get(messageId)
    if (!message) return
    message.pinned = pinned

    messageMitt.emit('changeMessagePinned', { message, pinned })
  }

  /*
    TODO: メッセージ一覧を取得するPromiseをここに置く
    さらにabortControllerをここにおけば、Promise変わったときにabortすることで
    同時に取得するのを止められる
  */
  const fileMetaDataMap = ref(new Map<FileId, FileInfo>())
  const fetchFileMetaData = async ({
    fileId,
    ignoreCache = false
  }: {
    fileId: FileId
    ignoreCache?: boolean
  }) => {
    if (!ignoreCache && fileMetaDataMap.value.has(fileId)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return fileMetaDataMap.value.get(fileId)!
    }

    const [{ data: fileMetaData }, shared] = await getFileMeta(fileId)
    if (!shared) {
      fileMetaDataMap.value.set(fileMetaData.id, fileMetaData)
    }
    return fileMetaData
  }

  const ogpDataMap = ref(new Map<ExternalUrl, Ogp | undefined>())
  const fetchOgpData = async ({
    url,
    ignoreCache = false
  }: {
    url: ExternalUrl
    ignoreCache?: boolean
  }) => {
    if (!ignoreCache && ogpDataMap.value.has(url)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return ogpDataMap.value.get(url)!
    }

    try {
      const [{ data: ogpData }, shared] = await getOgp(url)
      // ページにOGPが存在しない場合、undefinedを返す
      if (ogpData.type === 'empty') {
        if (!shared) ogpDataMap.value.set(url, undefined)
        return undefined
      }
      if (!shared) {
        ogpDataMap.value.set(url, ogpData)
      }
      return ogpData
    } catch (e: unknown) {
      const err = e as AxiosError
      // eslint-disable-next-line no-console
      console.error(err)

      return undefined
    }
  }

  wsListener.on('MESSAGE_CREATED', async ({ id, is_citing }) => {
    const message = await fetchMessage({ messageId: id })
    messageMitt.emit('addMessage', { message, isCiting: is_citing })
  })
  wsListener.on('MESSAGE_UPDATED', async ({ id }) => {
    const message = await fetchMessage({
      messageId: id,
      ignoreCache: true
    })
    messageMitt.emit('updateMessage', message)
  })
  wsListener.on('MESSAGE_DELETED', ({ id }) => {
    deleteMessage(id)
  })
  wsListener.on('MESSAGE_STAMPED', e => {
    const {
      message_id: messageId,
      user_id: userId,
      stamp_id: stampId,
      count,
      created_at: createdAt
    } = e
    if (!messagesMap.value.has(messageId)) return

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { stamps } = messagesMap.value.get(messageId)!

    // 既に押されているスタンプは更新、新規は追加
    if (
      stamps.some(stamp => stamp.stampId === stampId && stamp.userId === userId)
    ) {
      const newStamps = stamps.map(stamp =>
        stamp.stampId === stampId && stamp.userId === userId
          ? { ...stamp, count, createdAt: createdAt }
          : stamp
      )
      updateMessageStamps(messageId, newStamps)
    } else {
      const stamp: MessageStamp = {
        userId,
        stampId,
        count,
        createdAt,
        updatedAt: createdAt
      }
      updateMessageStamps(messageId, [...stamps, stamp])
    }
  })
  wsListener.on('MESSAGE_UNSTAMPED', e => {
    const { message_id: messageId, user_id: userId, stamp_id: stampId } = e
    if (!messagesMap.value.has(messageId)) return

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { stamps } = messagesMap.value.get(messageId)!

    const newStamps = stamps.filter(
      stamp => !(stamp.stampId === stampId && stamp.userId === userId)
    )

    updateMessageStamps(messageId, newStamps)
  })
  wsListener.on('MESSAGE_PINNED', ({ message_id }) => {
    setMessagePinnedState(message_id, true)
  })
  wsListener.on('MESSAGE_UNPINNED', ({ message_id }) => {
    setMessagePinnedState(message_id, false)
  })
  // reconnect時のメッセージの再取得処理はそれぞれの方で行う
  wsListener.on('reconnect', () => {
    messageMitt.emit('reconnect')
  })

  return {
    messagesMap,
    fileMetaDataMap,
    ogpDataMap,
    extendMessagesMap,
    fetchMessage,
    fetchFileMetaData,
    fetchOgpData
  }
})

export const useMessagesStore = convertToRefsStore(useMessagesStorePinia)

if (import.meta.hot) {
  import.meta.hot.accept(
    acceptHMRUpdate(useMessagesStorePinia, import.meta.hot)
  )
}
