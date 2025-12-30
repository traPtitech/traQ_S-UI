import { ChannelSubscribeLevel } from '@traptitech/traq'

import type { Ref } from 'vue'
import { computed, onBeforeUnmount, watch } from 'vue'

import { useEventListener } from '@vueuse/core'

import apis, { beacon } from '/@/lib/apis'
import flushableDebounce from '/@/lib/flushableDebounce'
import { useSubscriptionStore } from '/@/store/domain/subscription'
import type { ChannelId } from '/@/types/entity-ids'

import createOptimisticUpdater from '../../lib/optimisticUpdate'

const useChannelSubscriptionState = (channelId: Ref<ChannelId>) => {
  const { getSubscriptionLevel, changeSubscriptionLevel: changeLevel } =
    useSubscriptionStore()

  const setChannelSubscribeLevel = flushableDebounce(
    5_000,
    createOptimisticUpdater({
      getState: (channelId: ChannelId) => getSubscriptionLevel(channelId),
      setState: (level: ChannelSubscribeLevel, channelId: ChannelId) =>
        changeLevel(channelId, level),
      execute: (level: ChannelSubscribeLevel, channelId: ChannelId) =>
        apis.setChannelSubscribeLevel(channelId, { level }, { adapter: beacon })
    })
  )

  const currentChannelSubscription = computed(() =>
    getSubscriptionLevel(channelId.value)
  )

  const changeSubscriptionLevel = (level: ChannelSubscribeLevel) => {
    if (!channelId.value) return
    changeLevel(channelId.value, level)
    setChannelSubscribeLevel(level, channelId.value)
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
