import { computed, reactive } from 'vue'

import { useStarredChannels } from '/@/store/domain/starredChannels'
import { useChannelsStore } from '/@/store/entities/channels'
import type { ChannelId } from '/@/types/entity-ids'

const useChannelState = (props: { channelId: ChannelId }) => {
  const { starredChannelSet } = useStarredChannels()
  const { channelsMap } = useChannelsStore()

  const state = reactive({
    starred: computed(() => starredChannelSet.value.has(props.channelId)),
    forced: computed(
      () => channelsMap.value.get(props.channelId)?.force ?? false
    ),
    archived: computed(
      () => channelsMap.value.get(props.channelId)?.archived ?? false
    )
  })
  return { channelState: state }
}

export default useChannelState
