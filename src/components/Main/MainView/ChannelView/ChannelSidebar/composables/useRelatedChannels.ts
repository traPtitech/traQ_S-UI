import { computed } from 'vue'
import type { ChannelId } from '/@/types/entity-ids'
import type { Channel } from '@traptitech/traq'
import { compareStringInsensitive } from '/@/lib/basic/string'
import { isDefined } from '/@/lib/basic/array'
import { useChannelTree } from '/@/store/domain/channelTree'
import { useChannelsStore } from '/@/store/entities/channels'

const compareNameInsensitive = (a: Channel, b: Channel) =>
  compareStringInsensitive(a.name, b.name)

const useRelatedChannels = (props: { channelId: ChannelId }) => {
  const { channelsMap } = useChannelsStore()
  const { topLevelChannels } = useChannelTree()

  const getParentChildrenChannels = () =>
    parent.value?.children
      .map(v => channelsMap.value.get(v))
      .filter(isDefined) ?? []

  const current = computed(() => channelsMap.value.get(props.channelId))
  const parent = computed(() => {
    if (!current.value?.parentId) return
    return channelsMap.value.get(current.value.parentId)
  })
  const siblings = computed(() => {
    // ルート直下のチャンネルの場合はルート直下のチャンネル
    const sibs =
      current.value?.parentId === null
        ? topLevelChannels.value
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
      .map(id => channelsMap.value.get(id))
      .filter(isDefined)
      .filter(el => !el.archived)
      .sort(compareNameInsensitive)
  )

  return { current, parent, siblings, children }
}

export default useRelatedChannels
