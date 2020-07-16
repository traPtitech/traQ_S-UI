import { computed } from '@vue/composition-api'
import store from '@/store'
import { ChannelId } from '@/types/entity-ids'
import { Channel } from '@traptitech/traq'
import { compareStringInsensitive } from '@/lib/util/string'

const useRelatedChannels = (props: { channelId: ChannelId }) => {
  const compareNameInsensitive = (a: Channel, b: Channel) =>
    compareStringInsensitive(a.name, b.name)

  const current = computed(() => store.state.entities.channels[props.channelId])
  const parent = computed(() => {
    if (!current.value.parentId) return undefined
    return store.state.entities.channels[current.value.parentId]
  })
  const siblings = computed(() => {
    const sibs =
      parent.value?.children.map(v => store.state.entities.channels[v]) ??
      store.state.domain.channelTree.channelTree.children.map(
        v => store.state.entities.channels[v.id]
      )
    return sibs.filter(el => !el.archived).sort(compareNameInsensitive)
  })
  const children = computed(() =>
    current.value.children
      .map(id => store.state.entities.channels[id])
      .filter(el => !el.archived)
      .sort(compareNameInsensitive)
  )

  return { current, parent, siblings, children }
}

export default useRelatedChannels
