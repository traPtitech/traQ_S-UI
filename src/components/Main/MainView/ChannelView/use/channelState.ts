import { computed, reactive } from 'vue'
import _store from '@/_store'
import store from '@/store'
import { ChannelId } from '@/types/entity-ids'

const useChannelState = (props: { channelId: ChannelId }) => {
  const state = reactive({
    stared: computed(
      () => props.channelId in _store.state.domain.me.staredChannelSet
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
