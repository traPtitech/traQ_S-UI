import { count } from '@/lib/util/string'
import { ChannelId } from '@/types/entity-ids'
import { Channel } from '@traptitech/traq'
import { dmParentUuid } from '@/lib/util/uuid'

const MAX_CHANNEL_DEPTH = 5
const MAX_CHANNEL_PATH_SLASHES = MAX_CHANNEL_DEPTH - 1

export const canCreateChildChannel = (
  channelPath: string,
  isArchived: boolean
) => !isArchived && count(channelPath, '/') < MAX_CHANNEL_PATH_SLASHES

export type SimpleChannel = {
  id: ChannelId
  name: string
}

export const channelIdToSimpleChannelPath = (
  channelId: ChannelId,
  channelMap: ReadonlyMap<ChannelId, Channel>
): SimpleChannel[] => {
  let channel = channelMap.get(channelId)
  if (!channel) {
    return []
  }

  const res = [{ id: channel.id, name: channel.name }]
  while (channel?.parentId && channel.parentId !== dmParentUuid) {
    channel = channelMap.get(channel.parentId)
    if (channel) {
      res.unshift({ id: channel.id, name: channel.name })
    }
  }
  return res
}

export const channelIdToPathString = (
  channelId: ChannelId,
  channelMap: ReadonlyMap<ChannelId, Channel>
): string => {
  const simpleChannelPath = channelIdToSimpleChannelPath(channelId, channelMap)
  return simpleChannelPath.map(c => c.name).join('/')
}
