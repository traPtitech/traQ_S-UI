import type { Message, Pin } from '@traptitech/traq'

import type { Ref } from 'vue'
import { onScopeDispose, ref, watch } from 'vue'

import useLatestRequest from '/@/composables/utils/useLatestRequest'
import useMittListener from '/@/composables/utils/useMittListener'
import apis from '/@/lib/apis'
import { wsListener } from '/@/lib/websocket'
import { messageMitt } from '/@/store/entities/messages'
import type { ChannelId, MessageId } from '/@/types/entity-ids'

const usePinnedMessages = (channelId: Ref<ChannelId>) => {
  const pinnedMessages = ref<Pin[]>([])

  type PinUpdate = (pins: Pin[]) => Pin[]
  type PinRequest = { message: Message; controller: AbortController }

  const updatesDuringFetch: PinUpdate[] = []
  const pendingPins = new Map<MessageId, PinRequest>()

  const updatePins = (update: PinUpdate) => {
    pinnedMessages.value = update(pinnedMessages.value)

    if (pins.isLoading.value) updatesDuringFetch.push(update)
  }

  const upsertPin = (pin: Pin) => {
    updatePins(pins => [
      ...new Map([...pins, pin].map(pin => [pin.message.id, pin])).values()
    ])
  }

  const updatePinnedMessage = (message: Message) => {
    const pending = pendingPins.get(message.id)

    if (pending) pending.message = message

    updatePins(pins =>
      pins.map(pin =>
        pin.message.id === message.id ? { ...pin, message } : pin
      )
    )
  }

  const removePinnedMessage = (messageId: MessageId) => {
    pendingPins.get(messageId)?.controller.abort()
    pendingPins.delete(messageId)

    updatePins(pins => pins.filter(pin => pin.message.id !== messageId))
  }

  const reportError = (error: unknown) => {
    // eslint-disable-next-line no-console
    console.error(error)
  }

  const clearPendingPins = () => {
    for (const request of pendingPins.values()) request.controller.abort()

    pendingPins.clear()
  }

  watch(
    channelId,
    () => {
      clearPendingPins()
      pinnedMessages.value = []
    },
    { flush: 'sync' }
  )

  onScopeDispose(clearPendingPins)

  const pins = useLatestRequest({
    source: channelId,

    fetch: async (id, signal) => {
      updatesDuringFetch.length = 0

      return (await apis.getChannelPins(id, { signal })).data
    },

    onSuccess: data => {
      pinnedMessages.value = updatesDuringFetch.reduce(
        (pins, update) => update(pins),
        data
      )

      updatesDuringFetch.length = 0
    },

    onError: reportError
  })

  const addPin = async (message: Message) => {
    pendingPins.get(message.id)?.controller.abort()

    const request: PinRequest = { message, controller: new AbortController() }
    pendingPins.set(message.id, request)

    try {
      const { data: pin } = await apis.getPin(message.id, {
        signal: request.controller.signal
      })

      if (pendingPins.get(message.id) !== request) return

      pendingPins.delete(message.id)

      upsertPin({
        userId: pin.userId,
        message: request.message,
        pinnedAt: pin.pinnedAt
      })
    } catch (error) {
      if (pendingPins.get(message.id) !== request) return

      pendingPins.delete(message.id)
      reportError(error)
    }
  }

  useMittListener(messageMitt, 'updateMessage', message => {
    if (channelId.value !== message.channelId) return

    updatePinnedMessage(message)
  })

  useMittListener(messageMitt, 'deleteMessage', messageId => {
    removePinnedMessage(messageId)
  })

  useMittListener(messageMitt, 'pinMessage', message => {
    if (channelId.value !== message.channelId) return

    void addPin(message)
  })

  useMittListener(messageMitt, 'unpinMessage', messageId => {
    removePinnedMessage(messageId)
  })

  useMittListener(wsListener, 'reconnect', () => {
    void pins.execute().catch(() => undefined)
  })

  return pinnedMessages
}

export default usePinnedMessages
