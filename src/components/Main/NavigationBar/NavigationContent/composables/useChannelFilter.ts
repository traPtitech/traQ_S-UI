import type { Channel } from '@traptitech/traq'

import type { Ref } from 'vue'
import { computed, ref } from 'vue'

import useChannelPath from '/@/composables/useChannelPath'
import type { MatchResult } from '/@/lib/channel'
import { channelDeepMatching, sortByChannelPath } from '/@/lib/channel'
import { useChannelsStore } from '/@/store/entities/channels'

type ChannelMatches = readonly Channel[] | MatchResult<Channel>

const sameChannels = (left: readonly Channel[], right: readonly Channel[]) =>
  left.length === right.length &&
  left.every((channel, index) => channel === right[index])

const useChannelFilter = (targetChannels: Ref<readonly Channel[]>) => {
  const { channelIdToPathString } = useChannelPath()
  const { channelsMap } = useChannelsStore()

  const targetChannelIds = computed(
    () => new Set(targetChannels.value.map(channel => channel.id))
  )
  const oneLetterChannels = computed(() =>
    targetChannels.value.filter(channel => channel.name.length === 1)
  )
  const rootChannels = computed(() =>
    targetChannels.value.filter(c => c.parentId === null)
  )

  const query = ref('')

  const matchedChannels = computed<ChannelMatches>(previous => {
    const q = query.value
    if (q.length === 0) return targetChannels.value

    // split の返り値は空配列にはならないのでキャストできる
    const queryArr = q.split(/[/\\]/) as [string, ...string[]]

    // queryが一文字のときは件数が多くなるので、少なくなるような条件にする
    if (q.length === 1) {
      // query が区切り文字のときはルート直下のチャンネル
      if (queryArr.length !== 1) return rootChannels.value

      // query が区切り文字でなく1文字のときは完全一致のみ
      return oneLetterChannels.value.filter(
        channel => channel.name.toLowerCase() === q.toLowerCase()
      )
    }

    const result = channelDeepMatching(
      channelsMap.value,
      queryArr,
      targetChannelIds.value
    )

    // 余分なソートを省くために、一致したチャンネルと完全一致の区分が同じ場合は前回の結果を返す
    if (
      previous &&
      'perfectMatched' in previous &&
      sameChannels(previous.perfectMatched, result.perfectMatched) &&
      sameChannels(previous.matched, result.matched)
    ) {
      return previous
    }

    return result
  })

  const filteredChannels = computed(() => {
    const result = matchedChannels.value
    if (!('perfectMatched' in result)) return result

    const getPath = (id: string) =>
      channelIdToPathString(id)?.toUpperCase() ?? ''
    return [
      ...sortByChannelPath(result.perfectMatched, getPath),
      ...sortByChannelPath(result.matched, getPath)
    ]
  })

  return { query, filteredChannels }
}

export default useChannelFilter
