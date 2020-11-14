import { computed } from 'vue'
import store from '@/store'
import useChannelPath from '@/use/channelPath'
import { compareStringInsensitive } from '@/lib/util/string'
import { nullUuid } from '@/lib/util/uuid'
import { Channel } from '@traptitech/traq'

const channelToChannelId = (channel?: Channel) => channel?.id ?? nullUuid

/**
 * @param nullKeyName nullに当てるkey、undefined時はnullを含めない
 * @param channelToVal 引数のchannelはnullChannelのときはundefined
 */
const useChannelOptions = (
  nullKeyName: string | undefined,
  channelToVal: (channel?: Channel) => string = channelToChannelId
) => {
  const { channelIdToPathString } = useChannelPath()

  const nullVal = nullKeyName
    ? {
        key: nullKeyName,
        value: channelToVal()
      }
    : undefined

  const channelOptions = computed(() => {
    const channels = Object.values(store.state.entities.channels)
      .map(channel => ({
        key: channelIdToPathString(channel.id, true),
        value: channelToVal(channel)
      }))
      .sort((a, b) => compareStringInsensitive(a.key, b.key))

    return nullVal ? [nullVal, ...channels] : channels
  })
  return { channelOptions }
}

export default useChannelOptions
