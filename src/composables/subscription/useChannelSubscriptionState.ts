import type { Ref } from 'vue'
import { computed } from 'vue'
import { ChannelSubscribeLevel } from '@traptitech/traq'
import type { ChannelId } from '/@/types/entity-ids'
import { useSubscriptionStore } from '/@/store/domain/subscription'

const useChannelSubscriptionState = (channelId: Ref<ChannelId>) => {
  const { subscriptionMap, changeSubscriptionLevel: changeLevel } =
    useSubscriptionStore()

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
