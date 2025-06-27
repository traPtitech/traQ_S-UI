import type { ChannelId, DMChannelId } from '/@/types/entity-ids'
import { constructUserPath, constructChannelPath } from '/@/router'
import type { SimpleChannel } from '/@/lib/channel'
import { channelIdToSimpleChannelPath as libChannelIdToSimpleChannelPath } from '/@/lib/channel'
import { channelPathToId } from '/@/lib/channelTree'
import { useChannelsStore } from '/@/store/entities/channels'
import { useUsersStore } from '../store/entities/users'
import { useChannelTree } from '/@/store/domain/channelTree'
import { string } from 'zod'

const useChannelPath = () => {
  const { channelsMap, dmChannelsMap } = useChannelsStore()
  const { usersMap } = useUsersStore()
  const { topLevelChannels } = useChannelTree()

  const getUserNameByDMChannelId = (dmChannelId: DMChannelId) => {
    const dmChannel = dmChannelsMap.value.get(dmChannelId)
    if (!dmChannel) return ''
    return usersMap.value.get(dmChannel.userId)?.name ?? ''
  }

  const channelIdToSimpleChannelPath = (
    id: ChannelId | DMChannelId
  ): SimpleChannel[] => {
    if (dmChannelsMap.value.has(id)) {
      return [
        {
          id,
          name: getUserNameByDMChannelId(id)
        }
      ]
    } else if (!channelsMap.value.has(id)) {
      throw `channelIdToPath: No channel: ${id}`
    }
    return libChannelIdToSimpleChannelPath(id, channelsMap.value)
  }

  const channelIdToPath = (id: ChannelId | DMChannelId): string[] =>
    channelIdToSimpleChannelPath(id).map(c => c.name)

  const dmChannelIdToPathString = (id: DMChannelId, hashed = false): string =>
    (hashed ? '@' : '') + (getUserNameByDMChannelId(id) ?? '')

  const channelIdToPathString = (
    id: ChannelId | DMChannelId,
    hashed = false
  ): string => {
    if (dmChannelsMap.value.has(id)) return dmChannelIdToPathString(id, hashed)
    return (hashed ? '#' : '') + channelIdToPath(id).join('/')
  }

  const stringMinimaze = (
    data : string[],
    text : string
  ): string => {
    const index: number = data.indexOf(text);
    if (index !== -1) {
      data.splice(index, 1);
    }
    console.log(text,data)
    for (var i=0;i < text.length;i++){
      data = data.filter((word) => word[i] === text[i])
      if (data.length === 0){
        return text.slice(0,i+1)
      }
    }
    return text;
  }

  const channelIdToShortPathString = (
    id: ChannelId | DMChannelId,
    hashed = false
  ): string => {
    const channelsSimple = channelIdToSimpleChannelPath(id)
    const channelsId = channelsSimple.map((simpchan) =>  simpchan.id)
    //const channelsName = channelsSimple.map((simpchan) =>  simpchan.name)
    const channelsbrotherId = [topLevelChannels.value.map((x) => x.id)]
    for (var i=1;i < channelsId.length;i++){
      channelsbrotherId.push(channelsMap.value.get(channelsMap.value.get(channelsId[i]!)?.parentId!)?.children!)
    }
    const channelsbrothername = []
    for (var i=0;i < channelsId.length;i++){
      channelsbrothername.push(channelsbrotherId[i]?.filter((x) => !channelsMap.value.get(x)?.archived).map((x) => channelsMap.value.get(x)!.name))
    }
    if (dmChannelsMap.value.has(id)) {
      return dmChannelIdToPathString(id, hashed)
    }
    const channels = channelIdToPath(id)
    const formattedChannels = []
    for (var i=0;i<channels.length-1;i++){
        formattedChannels.push(stringMinimaze(channelsbrothername[i]!,channels[i]!))
    }
    formattedChannels.push(channels.pop() ?? '')
    return (hashed ? '#' : '') + formattedChannels.join('/')
  }

  const channelIdToLink = (id: ChannelId | DMChannelId) => {
    const pathString = channelIdToPathString(id, false)
    if (dmChannelsMap.value.has(id)) {
      return constructUserPath(pathString)
    }
    return constructChannelPath(pathString)
  }

  return {
    channelPathToId,
    channelIdToPath,
    channelIdToSimpleChannelPath,
    channelIdToPathString,
    channelIdToShortPathString,
    channelIdToLink
  }
}

export default useChannelPath
