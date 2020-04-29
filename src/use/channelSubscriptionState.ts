import { computed } from '@vue/composition-api'
import store from '@/store'
import { ChannelSubscribeLevel } from '@traptitech/traq'

const useChannelSubscriptionState = () => {
  const currentChannelId = computed(
    () => store.state.domain.messagesView.currentChannelId
  )
  const currentChannelSubscription = computed(
    () =>
      store.state.domain.me.subscriptionMap[currentChannelId.value ?? ''] ??
      ChannelSubscribeLevel.none
  )
  const changeSubscriptionLevel = async (level: ChannelSubscribeLevel) => {
    if (!currentChannelId.value) return
    await store.dispatch.domain.me.changeSubscriptionLevel({
      channelId: currentChannelId.value,
      subscriptionLevel: level
    })
    await store.dispatch.domain.channelTree.constructHomeChannelTree()
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
