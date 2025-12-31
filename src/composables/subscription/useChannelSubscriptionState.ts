import { ChannelSubscribeLevel } from '@traptitech/traq'

import type { Ref } from 'vue'
import { computed, onBeforeUnmount, ref, watch } from 'vue'

import { useEventListener } from '@vueuse/core'
import { debounce } from 'throttle-debounce'

import apis from '/@/lib/apis'
import createBeaconDispatcher from '/@/lib/beacon'
import createOptimisticUpdater from '/@/lib/optimisticUpdate'
import { useSubscriptionStore } from '/@/store/domain/subscription'
import type { ChannelId } from '/@/types/entity-ids'
import type { Invocable } from '/@/types/utility'

const useChannelSubscriptionState = (channelId: Ref<ChannelId>) => {
  const { getSubscriptionLevel, changeSubscriptionLevel: changeLevel } =
    useSubscriptionStore()

  const flushChannelSubscribeLevel: Ref<Invocable> = ref(() => void 0)

  const applyChannelSubscribeLevel = debounce(
    5_000,
    (level: ChannelSubscribeLevel, channelId: ChannelId) =>
      apis.setChannelSubscribeLevel(channelId, { level })
  )

  const setChannelSubscribeLevel = createOptimisticUpdater({
    getState: getSubscriptionLevel,
    setState: (level: ChannelSubscribeLevel, channelId: ChannelId) =>
      changeLevel(channelId, level),
    execute: applyChannelSubscribeLevel
  })

  const currentChannelSubscription = computed(() =>
    getSubscriptionLevel(channelId.value)
  )

  const changeSubscriptionLevel = async (level: ChannelSubscribeLevel) => {
    if (!channelId.value) return
    setChannelSubscribeLevel(level, channelId.value)

    // NOTE: 非同期処理はページのリロード等によって中断される場合があるので flush は同期的に行う必要がある
    const dispatch = await createBeaconDispatcher(
      apis.setChannelSubscribeLevel.bind(apis),
      channelId.value,
      { level }
    )

    flushChannelSubscribeLevel.value = () => {
      applyChannelSubscribeLevel.cancel({ upcomingOnly: true })
      dispatch()
    }
  }

  useEventListener(document, 'visibilitychange', () => {
    if (document.hidden) flushChannelSubscribeLevel.value()
  })

  useEventListener(
    ['blur', 'pagehide', 'beforeunload'],
    flushChannelSubscribeLevel
  )
  onBeforeUnmount(flushChannelSubscribeLevel)
  watch(channelId, () => flushChannelSubscribeLevel.value())

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
