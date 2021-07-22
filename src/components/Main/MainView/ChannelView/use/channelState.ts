import { computed, reactive } from 'vue'
import store from '/@/store'
import { ChannelId } from '/@/types/entity-ids'

const useChannelState = (props: { channelId: ChannelId }) => {
  const state = reactive({
    stared: computed(() =>
      store.state.domain.me.staredChannelSet.has(props.channelId)
    ),
    forced: computed(
      () =>
        store.state.entities.channelsMap.get(props.channelId)?.force ?? false
    ),
    archived: computed(
      () =>
        store.state.entities.channelsMap.get(props.channelId)?.archived ?? false
    )
  })
  return { channelState: state }
}

export default useChannelState
