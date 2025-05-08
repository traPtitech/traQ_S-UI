import type { FileInfo, Message, MessageStamp, Ogp } from '@traptitech/traq'
import type { AxiosError } from 'axios'
import mitt from 'mitt'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import apis from '/@/lib/apis'
import { createSingleflight } from '/@/lib/basic/async'
import { wsListener } from '/@/lib/websocket'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import type {
  ExternalUrl,
  FileId,
  MessageId,
  StampId
} from '/@/types/entity-ids'
import { useMeStore } from '/@/store/domain/me'

type MessageEventMap = {
  reconnect: void
  addMessage: { message: Message; isCiting: boolean }
  updateMessage: Message
  deleteMessage: MessageId
  changeMessagePinned: { message: Message; pinned: boolean }
}

type OptimisticStamp = {
  type: 'add' | 'remove'
  messageId: MessageId
  stampId: StampId
}

export const messageMitt = mitt<MessageEventMap>()

const getMessage = createSingleflight(apis.getMessage.bind(apis))
const getFileMeta = createSingleflight(apis.getFileMeta.bind(apis))
const getOgp = createSingleflight(apis.getOgp.bind(apis))

const useMessagesStorePinia = defineStore('entities/messages', () => {
  const { myId } = useMeStore()

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

  const optimisticStamps: OptimisticStamp[] = []

  const addOptimisticStamp = (stamp: OptimisticStamp) => {
    optimisticStamps.push(stamp)
  }

  const removeOptimisticStamp = (stamp: OptimisticStamp): boolean => {
    const index = optimisticStamps.findIndex(
      s =>
        s.type === stamp.type &&
        s.messageId === stamp.messageId &&
        s.stampId === stamp.stampId
    )
    if (index !== -1) {
      optimisticStamps.splice(index, 1)
      return true
    }
    return false
  }

  const addStampLocally = (messageId: MessageId, stampId: StampId) => {
    if (myId.value === undefined) return

    if (!messagesMap.value.has(messageId)) return

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { stamps } = messagesMap.value.get(messageId)!

    const currentCount =
      stamps.find(
        stamp => stamp.stampId === stampId && stamp.userId === myId.value
      )?.count ?? 0

    const newStamps =
      currentCount > 0
        ? // スタンプが既に押されている場合はカウントを増やす
          stamps.map(stamp =>
            stamp.stampId === stampId && stamp.userId === myId.value
              ? {
                  ...stamp,
                  count: currentCount + 1,
                  updatedAt: new Date().toISOString()
                }
              : stamp
          )
        : // スタンプが押されていない場合は新しく追加
          [
            ...stamps,
            {
              userId: myId.value,
              stampId,
              count: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ]
    updateMessageStamps(messageId, newStamps)

    addOptimisticStamp({ type: 'add', messageId, stampId })

    return () => {
      removeOptimisticStamp({ type: 'add', messageId, stampId })

      if (!messagesMap.value.has(messageId)) return

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const { stamps } = messagesMap.value.get(messageId)!

      const revertedStamps = stamps
        .map(stamp =>
          stamp.stampId === stampId && stamp.userId === myId.value
            ? stamp.count > 1
              ? { ...stamp, count: stamp.count - 1 }
              : undefined
            : stamp
        )
        .filter(stamp => !!stamp)
      updateMessageStamps(messageId, revertedStamps)
    }
  }

  const removeStampLocally = (messageId: MessageId, stampId: StampId) => {
    if (myId.value === undefined) return

    if (!messagesMap.value.has(messageId)) return

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { stamps } = messagesMap.value.get(messageId)!

    const index = stamps.findIndex(
      stamp => stamp.stampId === stampId && stamp.userId === myId.value
    )
    const removingStamp = stamps[index]
    const newStamps = stamps.filter((_, i) => i !== index)

    updateMessageStamps(messageId, newStamps)

    addOptimisticStamp({ type: 'remove', messageId, stampId })

    return () => {
      removeOptimisticStamp({ type: 'remove', messageId, stampId })

      if (!messagesMap.value.has(messageId)) return

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const { stamps } = messagesMap.value.get(messageId)!

      if (removingStamp === undefined) return
      const revertedStamps = [...stamps, removingStamp]
      updateMessageStamps(messageId, revertedStamps)
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
    const removed = removeOptimisticStamp({
      type: 'add',
      messageId: e.message_id,
      stampId: e.stamp_id
    })
    if (removed) return

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
    const removed = removeOptimisticStamp({
      type: 'remove',
      messageId: e.message_id,
      stampId: e.stamp_id
    })
    if (removed) return

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
    fetchOgpData,
    addStampLocally,
    removeStampLocally
  }
})

export const useMessagesStore = convertToRefsStore(useMessagesStorePinia)
