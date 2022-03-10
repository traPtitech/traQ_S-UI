import { computed, reactive } from 'vue'
import { ChannelId } from '/@/types/entity-ids'
import { useMeStore } from '/@/store/domain/me'
import { useChannelsStore } from '/@/store/entities/channels'

const useChannelState = (props: { channelId: ChannelId }) => {
  const { staredChannelSet } = useMeStore()
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
