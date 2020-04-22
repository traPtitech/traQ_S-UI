import router, { constructChannelPath } from '.'
import useChannelPath from '@/use/channelPath'
import { ChannelId } from '@/types/entity-ids'

const { channelIdToPathString } = useChannelPath()

export const changeChannelByPath = (channelPath: string) => {
  // 同じ場所に移動しようとした際のエラーを消す
  router.push(constructChannelPath(channelPath)).catch(() => {})
}

export const changeChannelById = (channelId: ChannelId) => {
  changeChannelByPath(channelIdToPathString(channelId))
}
