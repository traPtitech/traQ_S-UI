import { constructChannelPath, changeRouteByPath } from '.'
import useChannelPath from '@/use/channelPath'
import { ChannelId } from '@/types/entity-ids'
const { channelIdToPathString } = useChannelPath()

export const changeChannelByPath = (channelPath: string) => {
  changeRouteByPath(constructChannelPath(channelPath))
}

export const changeChannelById = (channelId: ChannelId) => {
  changeChannelByPath(channelIdToPathString(channelId))
}
