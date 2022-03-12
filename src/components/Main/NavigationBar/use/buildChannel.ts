import { isDefined } from '/@/lib/basic/array'
import { ChannelId } from '/@/types/entity-ids'
import { Channel } from '@traptitech/traq'

export const buildDescendantsChannelArray = (
  channelsMap: Map<ChannelId, Channel>,
  id: ChannelId,
  containArchive: boolean
) => {
  if (!channelsMap.has(id)) {
    throw `channelIdToPath: No channel: ${id}`
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const channel = channelsMap.get(id)!
  if (channel.archived) return []

  const result = [channel]
  let i = 0
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  while (result.length !== i + 1 || result[i]!.children.length > 0) {
    result.push(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ...result[i]!.children.map(c => channelsMap.get(c))
        .filter(isDefined)
        .filter(ch => (containArchive ? !ch.archived : ch))
    )
    i++
  }
  return result
}
