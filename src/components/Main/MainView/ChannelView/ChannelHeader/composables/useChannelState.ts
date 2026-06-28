import { computed, reactive } from 'vue'

import { useStaredChannels } from '/@/store/domain/staredChannels'
import { useChannelsStore } from '/@/store/entities/channels'
import type { ChannelId } from '/@/types/entity-ids'

const useChannelState = (props: { channelId: ChannelId }) => {
  const { staredChannelSet } = useStaredChannels()
  const { channelsMap } = useChannelsStore()

  const state = reactive({
    stared: computed(() => staredChannelSet.value.has(props.channelId)),
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
