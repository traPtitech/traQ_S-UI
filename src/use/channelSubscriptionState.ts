import { computed } from 'vue'
import { ChannelSubscribeLevel } from '@traptitech/traq'
import { useMessagesView } from '/@/store/domain/messagesView'
import { useMeStore } from '/@/store/domain/me'

const useChannelSubscriptionState = () => {
  const { currentChannelId } = useMessagesView()
  const { subscriptionMap, changeSubscriptionLevel: changeLevel } = useMeStore()

  const currentChannelSubscription = computed(
    () =>
      subscriptionMap.value.get(currentChannelId.value ?? '') ??
      ChannelSubscribeLevel.none
  )
  const changeSubscriptionLevel = (level: ChannelSubscribeLevel) => {
    if (!currentChannelId.value) return
    changeLevel(currentChannelId.value, level)
  }
  const changeToNextSubscriptionLevel = () => {
    const level =
      currentChannelSubscription.value === ChannelSubscribeLevel.notified
        ? ChannelSubscribeLevel.none
        : currentChannelSubscription.value === ChannelSubscribeLevel.subscribed
        ? ChannelSubscribeLevel.notified
        : ChannelSubscribeLevel.subscribed
    changeSubscriptionLevel(level)
  }
  return {
    currentChannelSubscription,
    changeSubscriptionLevel,
    changeToNextSubscriptionLevel
  }
}

export default useChannelSubscriptionState
