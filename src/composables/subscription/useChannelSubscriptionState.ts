import { ChannelSubscribeLevel } from '@traptitech/traq'

import type { ComputedRef, WatchSource } from 'vue'
import { computed, toValue, watch } from 'vue'

import { useEventListener } from '@vueuse/core'

import apis from '/@/lib/apis'
import createBeaconDispatcher from '/@/lib/beacon'
import { IterableCache } from '/@/lib/cache'
import flushableDebounce from '/@/lib/flushableDebounce'
import createOptimisticUpdater from '/@/lib/optimisticUpdate'
import { useSubscriptionStore } from '/@/store/domain/subscription'
import type { ChannelId } from '/@/types/entity-ids'
import type { Invocable } from '/@/types/utility'

type ChannelSubscriptionState = {
  currentChannelSubscription: ComputedRef<ChannelSubscribeLevel>
  flush: () => void
  fastFlush: Invocable
  changeSubscriptionLevel: (level: ChannelSubscribeLevel) => Promise<void>
  changeToNextSubscriptionLevel: () => void
}

const factory = (channelId: ChannelId): ChannelSubscriptionState => {
  const { getSubscriptionLevel, changeSubscriptionLevel: changeLevel } =
    useSubscriptionStore()

  const currentChannelSubscription = computed(() =>
    getSubscriptionLevel(channelId)
  )

  let fastFlush: Invocable = () => void 0

  const applyChannelSubscribeLevel = flushableDebounce(
    5_000,
    (level: ChannelSubscribeLevel) => {
      apis
        .setChannelSubscribeLevel(channelId, { level })
        .catch(setChannelSubscribeLevel.rollback)
    }
  )

  const setChannelSubscribeLevel = createOptimisticUpdater({
    getState: () => currentChannelSubscription.value,
    setState: level => changeLevel(channelId, level),
    execute: applyChannelSubscribeLevel
  })

  const changeSubscriptionLevel = async (level: ChannelSubscribeLevel) => {
    if (!channelId) return
    setChannelSubscribeLevel(level)

    // NOTE: 非同期処理はページのリロード等によって中断される場合があるので flush は同期的に行う必要がある
    const dispatch = await createBeaconDispatcher(
      apis.setChannelSubscribeLevel.bind(apis),
      channelId,
      { level }
    )

    fastFlush = () => {
      applyChannelSubscribeLevel.cancel({ upcomingOnly: true })
      dispatch().catch(setChannelSubscribeLevel.rollback)
    }
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
    changeToNextSubscriptionLevel,
    flush: () => applyChannelSubscribeLevel.flush(),
    fastFlush: () => fastFlush()
  }
}

const useChannelSubscriptionState = (channelIdRef: WatchSource<ChannelId>) => {
  const cache = new IterableCache<ChannelId, ChannelSubscriptionState>(factory)

  const currentState = computed(() => cache.getOrCreate(toValue(channelIdRef)))

  const currentChannelSubscription = computed(
    () => currentState.value.currentChannelSubscription.value
  )

  const changeSubscriptionLevel = (level: ChannelSubscribeLevel) =>
    currentState.value.changeSubscriptionLevel(level)

  const changeToNextSubscriptionLevel = () =>
    currentState.value.changeToNextSubscriptionLevel()

  const flushAll = () => cache.forEach(state => state.flush())
  const fastFlushAll = () => cache.forEach(state => state.fastFlush())

  watch(channelIdRef, (_newId, prevId) => cache.get(prevId)?.flush())

  useEventListener(document, 'visibilitychange', () => {
    if (document.hidden) flushAll()
  })

  useEventListener('blur', flushAll)
  useEventListener(['pagehide', 'beforeunload'], fastFlushAll)

  return {
    currentChannelSubscription,
    changeSubscriptionLevel,
    changeToNextSubscriptionLevel
  }
}

export default useChannelSubscriptionState
