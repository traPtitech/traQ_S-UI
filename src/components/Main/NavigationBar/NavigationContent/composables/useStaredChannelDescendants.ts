import type { ChannelId } from '/@/types/entity-ids'
import type { Channel } from '@traptitech/traq'
import { useChannelsStore } from '/@/store/entities/channels'
import { computed } from 'vue'
import { isDefined, unique } from '/@/lib/basic/array'
import { useStaredChannels } from '/@/store/domain/staredChannels'

const collectDescendants = (
  id: ChannelId,
  channelsMap: Map<ChannelId, Channel>
) => {
  if (!channelsMap.has(id)) {
    throw `channelIdToPath: No channel: ${id}`
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const channel = channelsMap.get(id)!

  const result = [channel.id, ...channel.children]
  for (let i = 0; i < result.length; i++) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const c = channelsMap.get(result[i]!)
    if (c) {
      result.push(...c.children)
    }
  }
  return result
}

// 関数名は Descendants だが、検索に自分自身も含ませるために、star しているチャンネル自身も含ませている
const useStaredChannelDescendants = () => {
  const { staredChannelSet } = useStaredChannels()
  const { channelsMap } = useChannelsStore()

  const startedChannelDescendantIds = computed(() =>
    unique(
      [...staredChannelSet.value].flatMap(channelId =>
        collectDescendants(channelId, channelsMap.value)
      )
    )
  )
  const startedChannelDescendants = computed(() =>
    startedChannelDescendantIds.value
      .map(channelId => channelsMap.value.get(channelId))
      .filter(isDefined)
  )

  return startedChannelDescendants
}

export default useStaredChannelDescendants
