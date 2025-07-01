import type { ChannelId, DMChannelId } from '/@/types/entity-ids'
import { constructUserPath, constructChannelPath } from '/@/router'
import type { SimpleChannel } from '/@/lib/channel'
import { channelIdToSimpleChannelPath as libChannelIdToSimpleChannelPath } from '/@/lib/channel'
import { channelPathToId } from '/@/lib/channelTree'
import { useChannelsStore } from '/@/store/entities/channels'
import { useUsersStore } from '../store/entities/users'
import { useChannelTree } from '/@/store/domain/channelTree'

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

  const stringMinimaze = (  //引数を直接変更してるのなんとかしろや
    data : string[],
    text : string
  ): string => {
    const index: number = data.indexOf(text);
    if (index !== -1) {
      data.splice(index, 1);
    }
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
    if (dmChannelsMap.value.has(id)) {
      return dmChannelIdToPathString(id, hashed)
    }
    const maxPathLength = 20
    const channels = channelIdToPath(id)
    const channelsSimple = channelIdToSimpleChannelPath(id)
    const channelsId = channelsSimple.map((simpchan) =>  simpchan.id)
    const channelsName = channelsId.map((c) => channelsMap.value.get(c)!.name)
    const formattedChannels = channelsName.map((c) => c[0])
    if (channels.length >= 3){
      const child = channelsId.pop() ?? ''
      const parent = channelsId.pop() ?? ''
      const grandparent = channelsId.pop() ?? ''
      const parent_brother = channelsMap.value.get(grandparent)?.children!
      const parent_similar_brother = parent_brother.filter((x) => channelsMap.value.get(x)!.name[0]! === channelsMap.value.get(parent)!.name[0])
      let count = 0;
      let comfusable = false
      for (const element of parent_similar_brother) {
        let array = channelsMap.value.get(element)?.children
        if (channelsMap.value.get(element)?.children!.length !== 0){
          for (const element_child of channelsMap.value.get(element)?.children!){
            if (channelsMap.value.get(element_child)!.name === channelsMap.value.get(child)!.name) {
              count++;
            }
            if (count >= 2) {
              comfusable = true
              break
            }
          }
        }
      }
      if (comfusable){
        const parent_name = channelsMap.value.get(parent)!.name
        formattedChannels.pop()
        formattedChannels.pop()
        formattedChannels.push(parent_name ?? '')
        const child_name = channelsMap.value.get(child)!.name
        formattedChannels.push(child_name ?? '')
        const path = formattedChannels.join("/")
        if (path.length <= maxPathLength){
          return (hashed ? '#' : '') + path
        } else {
          console.log(path)
          formattedChannels[formattedChannels.length-2] = ""
          const nonParentPath = formattedChannels.join("/")
          const nonParentPathsLength = nonParentPath.length
          console.log(nonParentPath)
          const N = Math.min(Math.max(maxPathLength - nonParentPathsLength,1),parent_name.length)
          console.log(N)
          formattedChannels[formattedChannels.length-2] = parent_name.slice(0,N)
          const boundedPath = formattedChannels.join("/")
          console.log(boundedPath)
          const parent_similar_brother_name = parent_similar_brother.map((x) => channelsMap.value.get(x)!.name)
          const shorted_parent_name = stringMinimaze(parent_similar_brother_name,parent_name)
          formattedChannels[formattedChannels.length-2] = shorted_parent_name
          const ShortedPath = formattedChannels.join("/")
          console.log(ShortedPath)
          console.log("xcvvvfgtewsgbi dnbp iugjipdsbzmgu svnmn uidgkjlsrevadar")
          if (N > shorted_parent_name.length){
            console.log("bounded")
            return (hashed ? '#' : '') + boundedPath
          } else {
            console.log("shorted")
            return (hashed ? '#' : '') + ShortedPath
          }
        }
      } else {
        formattedChannels.pop()
        const child_name = channelsMap.value.get(child)!.name
        formattedChannels.push(child_name ?? '')
        return (hashed ? '#' : '') + formattedChannels.join("/")
      }
    } else if (channels.length == 2){
      const child_name = channels.pop() ?? ''
      const parent_name = channels.pop() ?? ''
      const confusable_parents : string[] = []
      for (let i = 0;i<topLevelChannels.value.length;i++){
        const topLevelChannelId = topLevelChannels.value[i]?.id!
        if (channelsMap.value.get(topLevelChannelId)?.children.map((x) => channelsMap.value.get(x)!.name).includes(child_name)){
          confusable_parents.push(channelsMap.value.get(topLevelChannelId!)?.name!)
        }
      }
      const shorted_parent = stringMinimaze(confusable_parents,parent_name)
      return (hashed ? '#' : '') + shorted_parent + "/" + child_name
    } else if (channels.length == 1){
      const path = channels[0]
      return (hashed ? '#' : '') + path
    } else {
      return hashed ? '#' : ''
    }
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
