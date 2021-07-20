import { computed } from 'vue'
import store from '/@/store'
import { ChannelId } from '/@/types/entity-ids'
import { Channel } from '@traptitech/traq'
import { compareStringInsensitive } from '/@/lib/util/string'
import { isDefined } from '/@/lib/util/array'

const useRelatedChannels = (props: { channelId: ChannelId }) => {
  const compareNameInsensitive = (a: Channel, b: Channel) =>
    compareStringInsensitive(a.name, b.name)

  const getParentChildrenChannels = () =>
    parent.value?.children
      .map(v => store.state.entities.channelsMap.get(v))
      .filter(isDefined) ?? []

  const current = computed(() =>
    store.state.entities.channelsMap.get(props.channelId)
  )
  const parent = computed(() => {
    if (!current.value?.parentId) return undefined
    return store.state.entities.channelsMap.get(current.value.parentId)
  })
  const siblings = computed(() => {
    // ルート直下のチャンネルの場合はルート直下のチャンネル
    const sibs =
      current.value?.parentId === null
        ? store.getters.domain.channelTree.topLevelChannels
        : getParentChildrenChannels()
    return (
      sibs
        // 凍結されていても自身は含む
        .filter(el => current.value?.id === el.id || !el.archived)
        .sort(compareNameInsensitive)
    )
  })
  const children = computed(() =>
    current.value?.children
      .map(id => store.state.entities.channelsMap.get(id))
      .filter(isDefined)
      .filter(el => !el.archived)
      .sort(compareNameInsensitive)
  )

  return { current, parent, siblings, children }
}

export default useRelatedChannels
