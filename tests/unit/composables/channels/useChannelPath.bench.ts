import { computed, effectScope } from 'vue'

import { createTestingPinia } from '@pinia/testing'
import { bench, describe } from 'vitest'

import useChannelPath from '/@/composables/useChannelPath'
import { useChannelsStore } from '/@/store/entities/channels'

import { generateChannels } from './generateChannels'

const CHANNEL_COUNT = 8000
const UNREAD_COUNT = 500

createTestingPinia()
const { channelsMap, bothChannelsMapFetched } = useChannelsStore()
const channels = generateChannels({ seed: 1, size: CHANNEL_COUNT })
channelsMap.value = new Map(channels.map(c => [c.id, c]))
bothChannelsMapFetched.value = true

// 本番では、子を数百持つ親の下に未読が集中していた
const unreadChannelIds = channels
  .toSorted((a, b) => b.children.length - a.children.length)
  .flatMap(c => c.children)
  .slice(0, UNREAD_COUNT)

describe('useChannelPath', () => {
  bench(
    `channelIdToShortPathString for ${unreadChannelIds.length} unread channels`,
    () => {
      // サイドバーの各行と同じ呼び方にして、依存追跡のコストも含めて測る
      const scope = effectScope()
      scope.run(() =>
        unreadChannelIds.map(id => {
          const { channelIdToShortPathString } = useChannelPath()
          return computed(() => channelIdToShortPathString(id)).value
        })
      )
      // useChannelPath() が登録する watch を残さない
      scope.stop()
    },
    // 1 回が重く、既定の 500 ms ではサンプルが少なくてばらつく
    { time: 5000 }
  )
})
