import { ChannelTree, ChannelTreeNode } from '@/store/domain/channelTree/state'
import useChannelPath from '@/use/channelPath'

const TIMES = ['gps', 'times']

const useHomeChannel = () => {
  const { channelPathToId } = useChannelPath()

  const homeChannelFromUsername = (
    username: string,
    channelTree: ChannelTree | ChannelTreeNode
  ) => {
    const channelPath = [...TIMES]
    channelPath.push(username)

    try {
      return channelPathToId(channelPath, channelTree)
    } catch {
      return
    }
  }

  return { homeChannelFromUsername }
}

export default useHomeChannel
