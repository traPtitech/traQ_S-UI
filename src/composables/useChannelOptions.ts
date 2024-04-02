import type { Ref } from 'vue'
import { computed, unref } from 'vue'
import useChannelPath from '/@/composables/useChannelPath'
import { compareStringInsensitive } from '/@/lib/basic/string'
import { nullUuid } from '/@/lib/basic/uuid'
import type { Channel } from '@traptitech/traq'
import { useChannelsStore } from '/@/store/entities/channels'

const channelToChannelId = (channel?: Channel) => channel?.id ?? nullUuid

/**
 * @param nullKeyName nullに当てるkey、undefined時はnullを含めない
 * @param channelToVal 引数のchannelはnullChannelのときはundefined
 */
const useChannelOptions = (
  nullKeyName: Ref<string | undefined> | string | undefined,
  channelToVal: (channel?: Channel) => string = channelToChannelId,
  containsArchivedChannels = false
) => {
  const { channelsMap } = useChannelsStore()
  const { channelIdToPathString } = useChannelPath()

  const nullVal = computed(() => {
    const nullKeyNameUnref = unref(nullKeyName)
    return nullKeyNameUnref
      ? {
          key: nullKeyNameUnref,
          value: channelToVal()
        }
      : undefined
  })

  const channelOptions = computed(() => {
    const channels = [...channelsMap.value.values()]
      .filter(channel => containsArchivedChannels || !channel.archived)
      .map(channel => ({
        key: channelIdToPathString(channel.id, true),
        value: channelToVal(channel)
      }))
      .sort((a, b) => compareStringInsensitive(a.key, b.key))

    return nullVal.value ? [nullVal.value, ...channels] : channels
  })
  return { channelOptions }
}

export default useChannelOptions
