import { computed, reactive } from '@vue/composition-api'
import { Message } from '@traptitech/traq'
import store from '@/store'
import useChannelPath from '@/use/channelPath'

const useActiviyElement = (props: { message: Message }) => {
  const state = reactive({
    channelName: computed(
      () =>
        store.state.entities.channels[props.message.channelId ?? '']?.name ?? ''
    ),
    channelId: computed(() => props.message.channelId ?? ''),
    user: computed(() => store.state.entities.users[props.message.userId ?? ''])
  })
  if (state.user === undefined) {
    store.dispatch.entities.fetchUser(props.message.userId)
  }
  const path = useChannelPath().channelIdToShortPathString(state.channelId)
  return { activityElementState: state, path }
}

export default useActiviyElement
