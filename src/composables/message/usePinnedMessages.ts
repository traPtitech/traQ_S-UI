import { Pin, Message } from '@traptitech/traq'
import { Ref, ref, watch } from 'vue'
import apis from '/@/lib/apis'
import { wsListener } from '/@/lib/websocket'
import { messageMitt } from '/@/store/entities/messages'
import { ChannelId, MessageId } from '/@/types/entity-ids'

const usePinnedMessages = (channelId: Ref<ChannelId>) => {
  const pinnedMessages = ref<Pin[]>([])

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

  const fetchPins = async (channelId: ChannelId) => {
    pinnedMessages.value = []
    const res = await apis.getChannelPins(channelId)
    pinnedMessages.value = res.data
  }

  watch(
    channelId,
    async newChannelId => {
      await fetchPins(newChannelId)
    },
    { immediate: true }
  )

  messageMitt.on('updateMessage', async message => {
    if (channelId.value !== message.channelId) return
    updatePinnedMessage(message)
  })
  messageMitt.on('deleteMessage', messageId => {
    removePinnedMessage(messageId)
  })
  messageMitt.on('changeMessagePinned', async ({ message, pinned }) => {
    if (channelId.value !== message.channelId) return

    if (!pinned) {
      removePinnedMessage(message.id)
      return
    }

    const { data: pin } = await apis.getPin(message.id)
    addPinnedMessage({
      userId: pin.userId,
      message,
      pinnedAt: pin.pinnedAt
    })
  })
  wsListener.on('reconnect', async () => {
    await fetchPins(channelId.value)
  })

  return pinnedMessages
}

export default usePinnedMessages
