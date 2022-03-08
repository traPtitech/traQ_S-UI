import { computed, reactive } from 'vue'
import store from '/@/vuex'
import { ChannelId } from '/@/types/entity-ids'
import { useMeStore } from '/@/store/domain/me'

const useChannelState = (props: { channelId: ChannelId }) => {
  const { staredChannelSet } = useMeStore()

  const state = reactive({
    stared: computed(() => staredChannelSet.value.has(props.channelId)),
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
