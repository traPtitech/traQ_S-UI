import { computed } from '@vue/composition-api'
import store from '@/store'
import { SubscriptionLevel } from '@/store/domain/me'

const useChannelSubscriptionState = () => {
  const currentChannelId = computed(
    () => store.state.domain.messagesView.currentChannelId
  )
  const currentChannelSubscription = computed(
    () =>
      store.state.domain.me.subscriptionMap[currentChannelId.value] ?? 'none'
  )
  const changeSubscriptionLevel = (level: SubscriptionLevel) => {
    store.dispatch.domain.me.changeSubscriptionLevel({
      channelId: currentChannelId.value,
      subscriptionLevel: level
    })
  }
  const changeToNextSubscriptionLevel = () => {
    const level =
      currentChannelSubscription.value === 'notified'
        ? 'none'
        : currentChannelSubscription.value === 'subscribed'
        ? 'notified'
        : 'subscribed'
    changeSubscriptionLevel(level)
  }
  return {
    currentChannelSubscription,
    changeSubscriptionLevel,
    changeToNextSubscriptionLevel
  }
}

export default useChannelSubscriptionState
