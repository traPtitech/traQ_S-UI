import {
  ChannelSubscribeLevel,
  type PutChannelSubscribeLevelRequest
} from '@traptitech/traq'

import type { Ref } from 'vue'
import { computed, onBeforeUnmount, watch } from 'vue'

import { useEventListener } from '@vueuse/core'

import apis, { beacon } from '/@/lib/apis'
import flushableDebounce from '/@/lib/flushableDebounce'
import { useSubscriptionStore } from '/@/store/domain/subscription'
import type { ChannelId } from '/@/types/entity-ids'

const useChannelSubscriptionState = (channelId: Ref<ChannelId>) => {
  const { subscriptionMap, changeSubscriptionLevel: changeLevel } =
    useSubscriptionStore()

  const setChannelSubscribeLevel = flushableDebounce(
    5_000,
    (channelId: ChannelId, request: PutChannelSubscribeLevelRequest) => {
      apis.setChannelSubscribeLevel(channelId, request, { adapter: beacon })
    }
  )

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

  useEventListener(document, 'visibilitychange', () => {
    if (document.hidden) setChannelSubscribeLevel.flush()
  })
  useEventListener(
    ['blur', 'pagehide', 'beforeunload'],
    setChannelSubscribeLevel.flush
  )
  onBeforeUnmount(setChannelSubscribeLevel.flush)
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
