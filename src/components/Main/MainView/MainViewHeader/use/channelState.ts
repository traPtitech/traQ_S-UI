import { computed, reactive } from '@vue/composition-api'
import store from '@/store'
import { ChannelId } from '@/types/entity-ids'

const useChannelState = (props: { channelId: ChannelId }) => {
  const state = reactive({
    stared: computed(
      () => props.channelId in store.state.domain.me.staredChannelSet
    )
  })
  return { channelState: state }
}

export default useChannelState
