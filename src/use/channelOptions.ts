import { computed, Ref, unref } from 'vue'
import store from '/@/store'
import useChannelPath from '/@/use/channelPath'
import { compareStringInsensitive } from '/@/lib/basic/string'
import { nullUuid } from '/@/lib/basic/uuid'
import { Channel } from '@traptitech/traq'

const channelToChannelId = (channel?: Channel) => channel?.id ?? nullUuid

/**
 * @param nullKeyName nullに当てるkey、undefined時はnullを含めない
 * @param channelToVal 引数のchannelはnullChannelのときはundefined
 */
const useChannelOptions = (
  nullKeyName: Ref<string | undefined> | string | undefined,
  channelToVal: (channel?: Channel) => string = channelToChannelId
) => {
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
    const channels = [...store.state.entities.channelsMap.values()]
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
