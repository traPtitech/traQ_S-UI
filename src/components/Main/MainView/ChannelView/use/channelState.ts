import { computed, reactive } from '@vue/composition-api'
import store from '@/store'
import { ChannelId } from '@/types/entity-ids'

const useChannelState = (props: { channelId: ChannelId }) => {
  const state = reactive({
    stared: computed(
      () => props.channelId in store.state.domain.me.staredChannelSet
    ),
    forced: computed(
      () => store.state.entities.channels[props.channelId]?.force ?? false
    ),
    archived: computed(
      () => store.state.entities.channels[props.channelId]?.archived ?? false
    )
  })
  return { channelState: state }
}

export default useChannelState
