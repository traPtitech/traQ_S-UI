import { computed } from 'vue'
import store from '/@/vuex'
import { ChannelSubscribeLevel } from '@traptitech/traq'
import { useMessagesView } from '/@/store/domain/messagesView'

const useChannelSubscriptionState = () => {
  const { currentChannelId } = useMessagesView()

  const currentChannelSubscription = computed(
    () =>
      store.state.domain.me.subscriptionMap.get(currentChannelId.value ?? '') ??
      ChannelSubscribeLevel.none
  )
  const changeSubscriptionLevel = (level: ChannelSubscribeLevel) => {
    if (!currentChannelId.value) return
    store.dispatch.domain.me.changeSubscriptionLevel({
      channelId: currentChannelId.value,
      subscriptionLevel: level
    })
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
