import store from '@/store'
import { ChannelId } from '@/types/entity-ids'

export const buildDescendantsChannelArray = (id: ChannelId) => {
  if (!(id in store.state.entities.channels)) {
    throw `channelIdToPath: No channel: ${id}`
  }
  let channel = store.state.entities.channels[id]
  const result = [channel]
  let i = 0
  while (result.length != i + 1 || result[i].children.length != 0) {
    for (let v of channel.children) {
      channel = store.state.entities.channels[v]
      result.push(channel)
    }
    i++
  }
  return result
}
