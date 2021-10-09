import { isDefined } from '/@/lib/basic/array'
import store from '/@/store'
import { ChannelId } from '/@/types/entity-ids'

export const buildDescendantsChannelArray = (
  id: ChannelId,
  containArchive: boolean
) => {
  if (!store.state.entities.channelsMap.has(id)) {
    throw `channelIdToPath: No channel: ${id}`
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const channel = store.state.entities.channelsMap.get(id)!
  if (channel.archived) return []

  const result = [channel]
  let i = 0
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  while (result.length !== i + 1 || result[i]!.children.length > 0) {
    result.push(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ...result[i]!.children.map(c => store.state.entities.channelsMap.get(c))
        .filter(isDefined)
        .filter(ch => (containArchive ? !ch.archived : ch))
    )
    i++
  }
  return result
}
