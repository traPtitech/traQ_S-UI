import type { Ref } from 'vue'
import { computed, watch } from 'vue'
import { ChannelSubscribeLevel } from '@traptitech/traq'
import type { ChannelId } from '/@/types/entity-ids'
import { useSubscriptionStore } from '/@/store/domain/subscription'
import apis from '/@/lib/apis'
import useDebounceWithAutoFlush from '../utils/useDebounceWithAutoFlush'

const useChannelSubscriptionState = (channelId: Ref<ChannelId>) => {
  const { subscriptionMap, changeSubscriptionLevel: changeLevel } =
    useSubscriptionStore()

  const setChannelSubscribeLevel = useDebounceWithAutoFlush([
    10_000,
    apis.setChannelSubscribeLevel.bind(apis)
  ])

  const currentChannelSubscription = computed(
    () =>
      subscriptionMap.value.get(channelId.value ?? '') ??
      ChannelSubscribeLevel.none
  )

  const changeSubscriptionLevel = (level: ChannelSubscribeLevel) => {
    if (!channelId.value) return
    changeLevel(channelId.value, level)
    setChannelSubscribeLevel(channelId.value, { level })
  }

  watch(channelId, setChannelSubscribeLevel.flush)

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
