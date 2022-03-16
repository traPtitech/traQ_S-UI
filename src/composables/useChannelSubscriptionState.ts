import { computed, Ref } from 'vue'
import { ChannelSubscribeLevel } from '@traptitech/traq'
import { useMeStore } from '/@/store/domain/me'
import { ChannelId } from '/@/types/entity-ids'

const useChannelSubscriptionState = (channelId: Ref<ChannelId>) => {
  const { subscriptionMap, changeSubscriptionLevel: changeLevel } = useMeStore()

  const currentChannelSubscription = computed(
    () =>
      subscriptionMap.value.get(channelId.value ?? '') ??
      ChannelSubscribeLevel.none
  )
  const changeSubscriptionLevel = (level: ChannelSubscribeLevel) => {
    if (!channelId.value) return
    changeLevel(channelId.value, level)
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
