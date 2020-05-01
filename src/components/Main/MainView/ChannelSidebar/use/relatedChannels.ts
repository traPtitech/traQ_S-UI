import { computed } from '@vue/composition-api'
import store from '@/store'
import { ChannelId } from '@/types/entity-ids'

const useRelatedChannels = (props: { channelId: ChannelId }) => {
  const current = computed(() => store.state.entities.channels[props.channelId])
  const parent = computed(() => {
    if (!current.value.parentId) return undefined
    return store.state.entities.channels[current.value.parentId]
  })
  const siblings = computed(() => {
    if (!parent.value) {
      return store.state.domain.channelTree.channelTree.children
        .map(v => store.state.entities.channels[v.id])
        .filter(el => el.id !== current.value.id)
    }
    return parent.value.children
      .map(v => store.state.entities.channels[v])
      .filter(el => el.id !== current.value.id)
  })
  const children = computed(() =>
    current.value.children.map(id => store.state.entities.channels[id])
  )

  return { current, parent, siblings, children }
}

export default useRelatedChannels
