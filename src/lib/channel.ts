import { count } from '@/lib/util/string'

const MAX_CHANNEL_DEPTH = 5
const MAX_CHANNEL_PATH_SLASHES = MAX_CHANNEL_DEPTH - 1

export const canCreateChildChannel = (
  channelPath: string,
  isArchived: boolean
) => !isArchived && count(channelPath, '/') < MAX_CHANNEL_PATH_SLASHES
