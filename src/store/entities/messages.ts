import type { FileInfo, Message, MessageStamp, Ogp } from '@traptitech/traq'

import { ref } from 'vue'

import type { AxiosError } from 'axios'
import mitt from 'mitt'
import { defineStore } from 'pinia'

import apis from '/@/lib/apis'
import { createSingleflight } from '/@/lib/basic/async'
import { compareDateString } from '/@/lib/basic/date'
import { wsListener } from '/@/lib/websocket'
import { useMeStore } from '/@/store/domain/me'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import type {
  ExternalUrl,
  FileId,
  MessageId,
  StampId
} from '/@/types/entity-ids'

type MessageEventMap = {
  reconnect: void
  addMessage: { message: Message; isCiting: boolean }
  updateMessage: Message
  deleteMessage: MessageId
  pinMessage: Message
  unpinMessage: MessageId
}

type OptimisticStamp = {
  messageId: MessageId
  stampId: StampId
  userId: string
}

type StampMutations = {
  pending: Set<OptimisticStamp>
  refreshRequested: boolean
  refresh?: Promise<void>
}

export const messageMitt = mitt<MessageEventMap>()

export type CacheMessages = (messages: readonly Message[]) => Message[]

type MessageUpdate = (message: Message) => Message

const replaceStamp = (
  message: Message,
  stampId: StampId,
  userId: string,
  stamp?: MessageStamp
): Message => ({
  ...message,
  stamps: stamp
    ? message.stamps.some(s => s.stampId === stampId && s.userId === userId)
      ? message.stamps.map(s =>
          s.stampId === stampId && s.userId === userId ? stamp : s
        )
      : [...message.stamps, stamp]
    : message.stamps.filter(s => s.stampId !== stampId || s.userId !== userId)
})

const getFileMeta = createSingleflight(apis.getFileMeta.bind(apis))
const getOgp = createSingleflight(apis.getOgp.bind(apis))

const useMessagesStorePinia = defineStore('entities/messages', () => {
  const { myId } = useMeStore()

  /**
   * ここでは内容が更新されることのみを保障する
   * それぞれの方でメッセージIDの追加、削除の更新はする必要がある
   */
  const messagesMap = ref(new Map<MessageId, Message>())
  // 削除通知を受けたIDは、このストアの存続中は取得結果に戻さない。
  const deletedMessageIds = ref(new Set<MessageId>())
  const activeReads = new Set<Map<MessageId, MessageUpdate[]>>()
  const stampMutations = new Map<MessageId, StampMutations>()

  const isMessageDeleted = (messageId: MessageId) =>
    deletedMessageIds.value.has(messageId)

  // スタンプ・ピンは本文の更新日時が同じでも変化するため、同日時の取得結果も反映する。
  const writeMessages = (messages: Message[]) => {
    for (const message of messages) {
      if (isMessageDeleted(message.id)) continue

      const cached = messagesMap.value.get(message.id)

      if (cached && compareDateString(message.updatedAt, cached.updatedAt) < 0)
        continue

      messagesMap.value.set(message.id, message)
    }
  }

  const updateMessage = (
    messageId: MessageId,
    update: MessageUpdate,
    applyToCache = true
  ) => {
    for (const updates of activeReads) {
      const pending = updates.get(messageId) ?? []
      pending.push(update)
      updates.set(messageId, pending)
    }

    const message = messagesMap.value.get(messageId)
    if (applyToCache && message)
      messagesMap.value.set(messageId, update(message))
  }

  /**
   * 取得中の変更を再適用し、共有キャッシュへ登録した現在値を返す。
   * 削除済みIDは除外する。
   */
  const withMessageUpdates = async <T>(
    read: (cacheMessages: CacheMessages) => Promise<T>,
    signal?: AbortSignal
  ): Promise<T> => {
    signal?.throwIfAborted()

    const updates = new Map<MessageId, MessageUpdate[]>()
    activeReads.add(updates)

    const release = () => {
      activeReads.delete(updates)
      updates.clear()
    }
    signal?.addEventListener('abort', release, { once: true })

    const cacheMessages: CacheMessages = messages => {
      signal?.throwIfAborted()
      const merged: Message[] = []

      for (const incoming of messages) {
        if (isMessageDeleted(incoming.id)) continue
        const cached = messagesMap.value.get(incoming.id)

        let message =
          cached && compareDateString(cached.updatedAt, incoming.updatedAt) > 0
            ? cached
            : incoming

        for (const update of updates.get(incoming.id) ?? []) {
          message = update(message)
        }

        for (const pending of stampMutations.get(message.id)?.pending ?? []) {
          if (!cached) continue

          const stamp = cached.stamps.find(
            s => s.stampId === pending.stampId && s.userId === pending.userId
          )

          message = replaceStamp(
            message,
            pending.stampId,
            pending.userId,
            stamp
          )
        }

        writeMessages([message])
        merged.push(messagesMap.value.get(message.id) ?? message)
      }

      return merged
    }

    try {
      return await read(cacheMessages)
    } finally {
      signal?.removeEventListener('abort', release)
      release()
    }
  }

  const deleteMessage = (messageId: MessageId) => {
    deletedMessageIds.value.add(messageId)
    messagesMap.value.delete(messageId)

    messageMitt.emit('deleteMessage', messageId)
  }

  const readMessage = (messageId: MessageId) =>
    withMessageUpdates(async cacheMessages => {
      const { data } = await apis.getMessage(messageId)

      return cacheMessages([data])[0] ?? data
    })

  const getMessage = createSingleflight(readMessage)

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

    const [message] = await getMessage(messageId)

    return messagesMap.value.get(messageId) ?? message
  }

  const updateStamp = (
    messageId: MessageId,
    stampId: StampId,
    userId: string,
    stamp?: MessageStamp,
    applyToCache = true
  ) => {
    updateMessage(
      messageId,
      message => replaceStamp(message, stampId, userId, stamp),
      applyToCache
    )
  }
  const pinMessage = (messageId: MessageId) => {
    updateMessage(messageId, message => ({ ...message, pinned: true }))
    const message = messagesMap.value.get(messageId)
    if (!message) return

    messageMitt.emit('pinMessage', message)
  }

  const unpinMessage = (messageId: MessageId) => {
    updateMessage(messageId, message => ({ ...message, pinned: false }))

    messageMitt.emit('unpinMessage', messageId)
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

  const refreshStamps = (messageId: MessageId, state: StampMutations) => {
    state.refreshRequested = true
    if (state.pending.size > 0) return Promise.resolve()
    if (state.refresh) return state.refresh

    state.refresh = (async () => {
      try {
        while (state.refreshRequested && state.pending.size === 0) {
          state.refreshRequested = false
          if (isMessageDeleted(messageId)) break

          // 操作前に始まった単一取得には相乗りせず、HTTP完了後の値を取得する。
          await readMessage(messageId)
          const stamps = messagesMap.value.get(messageId)?.stamps

          if (stamps) {
            updateMessage(messageId, message => ({ ...message, stamps }), false)
          }
        }
      } catch (error) {
        // 楽観更新は解除済みなので、失敗しても次の通常取得で復旧できる。
        // eslint-disable-next-line no-console
        console.error(error)
      } finally {
        state.refresh = undefined
        if (state.pending.size === 0) stampMutations.delete(messageId)
      }
    })()

    return state.refresh
  }

  const beginStampOperation = (key: OptimisticStamp, rollback: () => void) => {
    const state = stampMutations.get(key.messageId) ?? {
      pending: new Set<OptimisticStamp>(),
      refreshRequested: false
    }
    stampMutations.set(key.messageId, state)
    state.pending.add(key)
    let settled = false

    const settle = async (undo?: () => void) => {
      if (settled) return
      settled = true
      state.pending.delete(key)
      undo?.()

      // 操作中に開始した取得には現在値を保ち、後続の取得にはサーバーの値を使う。
      const current = messagesMap.value
        .get(key.messageId)
        ?.stamps.find(
          stamp => stamp.stampId === key.stampId && stamp.userId === key.userId
        )
      updateStamp(key.messageId, key.stampId, key.userId, current, false)

      await refreshStamps(key.messageId, state)
    }

    return {
      commit: () => settle(),
      rollback: () => settle(rollback)
    }
  }

  const receiveStamp = (
    messageId: MessageId,
    stampId: StampId,
    userId: string,
    stamp?: MessageStamp
  ) => {
    const state = stampMutations.get(messageId)
    if (state?.refresh) state.refreshRequested = true

    const pending = [...(state?.pending ?? [])].some(
      operation => operation.stampId === stampId && operation.userId === userId
    )
    const current = messagesMap.value
      .get(messageId)
      ?.stamps.find(
        stamp => stamp.stampId === stampId && stamp.userId === userId
      )

    updateStamp(messageId, stampId, userId, pending ? current : stamp, !pending)

    if (!pending && userId === myId.value && messagesMap.value.has(messageId)) {
      const refresh = state ?? {
        pending: new Set<OptimisticStamp>(),
        refreshRequested: false
      }
      stampMutations.set(messageId, refresh)

      void refreshStamps(messageId, refresh)
    }
  }

  const addStampLocally = (messageId: MessageId, stampId: StampId) => {
    const userId = myId.value
    const message = messagesMap.value.get(messageId)
    if (!userId || !message) return
    const previous = message.stamps.find(
      s => s.stampId === stampId && s.userId === userId
    )
    const now = new Date().toISOString()

    const operation = beginStampOperation(
      { messageId, stampId, userId },
      () => {
        const stamp = messagesMap.value
          .get(messageId)
          ?.stamps.find(s => s.stampId === stampId && s.userId === userId)
        if (!stamp) return

        updateStamp(
          messageId,
          stampId,
          userId,
          stamp.count > 1 ? { ...stamp, count: stamp.count - 1 } : undefined
        )
      }
    )

    updateStamp(messageId, stampId, userId, {
      userId,
      stampId,
      count: (previous?.count ?? 0) + 1,
      createdAt: previous?.createdAt ?? now,
      updatedAt: now
    })

    return operation
  }

  const removeStampLocally = (messageId: MessageId, stampId: StampId) => {
    const userId = myId.value
    const message = messagesMap.value.get(messageId)
    if (!userId || !message) return

    const previous = message.stamps.find(
      s => s.stampId === stampId && s.userId === userId
    )

    const operation = beginStampOperation(
      { messageId, stampId, userId },
      () => {
        if (previous) updateStamp(messageId, stampId, userId, previous)
      }
    )

    updateStamp(messageId, stampId, userId)

    return operation
  }

  wsListener.on('MESSAGE_CREATED', async ({ id, is_citing }) => {
    const message = await fetchMessage({ messageId: id })
    if (isMessageDeleted(id)) return

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
    const current = messagesMap.value
      .get(messageId)
      ?.stamps.find(
        stamp => stamp.stampId === stampId && stamp.userId === userId
      )

    receiveStamp(messageId, stampId, userId, {
      userId,
      stampId,
      count,
      createdAt,
      updatedAt: current?.updatedAt ?? createdAt
    })
  })

  wsListener.on('MESSAGE_UNSTAMPED', e => {
    receiveStamp(e.message_id, e.stamp_id, e.user_id)
  })

  wsListener.on('MESSAGE_PINNED', ({ message_id }) => {
    pinMessage(message_id)
  })
  wsListener.on('MESSAGE_UNPINNED', ({ message_id }) => {
    unpinMessage(message_id)
  })
  // reconnect時のメッセージの再取得処理はそれぞれの方で行う
  wsListener.on('reconnect', () => {
    messageMitt.emit('reconnect')
  })

  return {
    messagesMap,
    fileMetaDataMap,
    ogpDataMap,
    withMessageUpdates,
    isMessageDeleted,
    fetchMessage,
    fetchFileMetaData,
    fetchOgpData,
    addStampLocally,
    removeStampLocally
  }
})

export const useMessagesStore = convertToRefsStore(useMessagesStorePinia)
