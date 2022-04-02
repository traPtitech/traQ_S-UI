import type { Channel } from '@traptitech/traq'
import type { Ref } from 'vue'
import { computed, ref } from 'vue'
import { channelDeepMatching } from '/@/lib/channel'
import { useChannelsStore } from '/@/store/entities/channels'

const useChannelFilter = (targetChannels: Ref<readonly Channel[]>) => {
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
  const filteredChannels = computed(() => {
    const q = query.value
    if (q.length === 0) {
      return targetChannels.value
    }

    // split の返り値は空配列にはならないのでキャストできる
    const queryArr = q.split(/[/\\]/) as [string, ...string[]]

    // queryが一文字のときは件数が多くなるので、少なくなるような条件にする
    if (q.length === 1) {
      // query が区切り文字のときはルート直下のチャンネル
      if (queryArr.length !== 1) {
        return rootChannels.value
      }

      // query が区切り文字でなく1文字のときは完全一致のみ
      return oneLetterChannels.value.filter(
        channel => channel.name.toLowerCase() === q.toLowerCase()
      )
    }

    const { perfectMatched: fullMatched, matched } = channelDeepMatching(
      channelsMap.value,
      queryArr,
      targetChannelIds.value
    )
    return [...fullMatched, ...matched]
  })

  return { query, filteredChannels }
}

export default useChannelFilter
