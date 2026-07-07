import type { Channel } from '@traptitech/traq'

import { computed } from 'vue'

import { isDefined, unique } from '/@/lib/basic/array'
import { useStarredChannels } from '/@/store/domain/starredChannels'
import { useChannelsStore } from '/@/store/entities/channels'
import type { ChannelId } from '/@/types/entity-ids'

const collectDescendants = (
  id: ChannelId,
  channelsMap: Map<ChannelId, Channel>
) => {
  if (!channelsMap.has(id)) {
    throw new Error(`channelIdToPath: No channel: ${id}`)
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
const useStarredChannelDescendants = () => {
  const { starredChannelSet } = useStarredChannels()
  const { channelsMap } = useChannelsStore()

  const starredChannelDescendantIds = computed(() =>
    unique(
      [...starredChannelSet.value].flatMap(channelId =>
        collectDescendants(channelId, channelsMap.value)
      )
    )
  )
  const starredChannelDescendants = computed(() =>
    starredChannelDescendantIds.value
      .map(channelId => channelsMap.value.get(channelId))
      .filter(isDefined)
  )

  return starredChannelDescendants
}

export default useStarredChannelDescendants
