import { computed } from '@vue/composition-api'
import store from '@/store'
import { ChannelId } from '@/types/entity-ids'

const useRelatedChannels = (props: { channelId: string }) => {
  const currentChannel = computed(
    () => store.state.entities.channels[props.channelId]
  )
  const parentChannel = computed(() => {
    if (!currentChannel.value.parentId) return undefined
    return store.state.entities.channels[currentChannel.value.parentId]
  })
  const siblingsChannel = computed(() => {
    if (!parentChannel.value) {
      return store.state.domain.channelTree.channelTree.children
        .map(v => store.state.entities.channels[v.id])
        .filter(el => el.id !== currentChannel.value.id)
    }
    return parentChannel.value.children
      .map(v => store.state.entities.channels[v])
      .filter(el => el.id !== currentChannel.value.id)
  })

  const current = computed(() => ({
    id: currentChannel.value.id,
    name: currentChannel.value.name,
    topic: currentChannel.value.topic
  }))
  const children = computed(() =>
    currentChannel.value.children.map(id => {
      const channel = store.state.entities.channels[id]
      return {
        id: channel.id,
        name: channel.name,
        topic: channel.topic
      }
    })
  )
  const parent = computed(() => {
    if (!parentChannel.value) return undefined
    return {
      id: parentChannel.value.id,
      name: parentChannel.value.name,
      topic: parentChannel.value.topic
    }
  })
  const siblings = computed(() =>
    siblingsChannel.value.map(v => ({
      id: v.id,
      name: v.name,
      topic: v.topic
    }))
  )
  return { current, children, parent, siblings }
}

export type RelatedChannelEntry = {
  id: ChannelId
  name: string
  topic: string
}

export default useRelatedChannels
