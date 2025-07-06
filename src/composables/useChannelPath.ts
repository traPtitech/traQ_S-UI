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

  const stringMinimazer = (
    data: string[],
    text: string
  ): string => {
    let data_: string[] = data.concat()
    const index: number = data_.indexOf(text)
    if (index !== -1) {
      data_.splice(index, 1)
    }
    for (let i = 0; i < text.length; i++) {
      data_ = data_.filter(word => word[i] === text[i])
      if (data_.length === 0) {
        return text.slice(0, i + 1)
      }
    }
    return text
  }

  const channelIdToBrotherId = (id: string): string[] => {
    const parentId = channelsMap.value.get(id)?.parentId
    if (parentId === null) {
      return topLevelChannels.value.filter(c => !c.archived).map(c => c.id)
    } else if (parentId === undefined) {
      return []
    } else {
      return (
        channelsMap.value
          .get(parentId)
          ?.children.filter(c => !channelsMap.value.get(c)?.archived) ?? ['']
      )
    }
  }

  const isHavingSameNameCousin = (id: string): boolean => {
    const selfName = channelsMap.value.get(id)?.name
    const parentId = channelsMap.value.get(id)?.parentId
    const parentbrothersId = channelIdToBrotherId(parentId ?? '').filter(
      c => c !== parentId
    )
    for (const brother of parentbrothersId) {
      const brotherChildId = channelsMap.value.get(brother)?.children ?? []
      for (const cousinId of brotherChildId) {
        const cousinName = channelsMap.value.get(cousinId)?.name
        if (cousinName === selfName) {
          return true
        }
      }
    }
    return false
  }

  const ChannelIdToUniqueInital = (id: string): string => {
    const selfName = channelsMap.value.get(id)?.name
    const brothersId = channelIdToBrotherId(id).filter(c => c !== id)
    const brothersName = brothersId.map(
      c => channelsMap.value.get(c)?.name ?? ''
    )
    return stringMinimazer(brothersName, selfName ?? '')
  }

  const channelIdToShortPathString = (
    id: ChannelId | DMChannelId,
    hashed = false
  ): string => {
    if (dmChannelsMap.value.has(id)) {
      return dmChannelIdToPathString(id, hashed)
    }
    const maxPathLength = 20
    const channelsSimple = channelIdToSimpleChannelPath(id)
    const channelsId = channelsSimple.map(simpchan => simpchan.id)
    const channelsName = channelsSimple.map(simpchan => simpchan.name)
    const channelsInit = channelsName.map(c => c[0])
    const formattedChannels = channelsInit.slice(0, -1)
    formattedChannels.push(channelsName[channelsName.length - 1])
    if (formattedChannels.join('/').length >= maxPathLength) {
      return formattedChannels.join('/')
    }
    if (channelsId.length >= 2) {
      let extendChannelIndex = channelsSimple.length - 1 // その名前のいとこチャンネルがいないかを検査するべきチャンネルのindex
      while (
        extendChannelIndex > 0 &&
        isHavingSameNameCousin(channelsId[extendChannelIndex] ?? '') &&
        formattedChannels.join('/').length < maxPathLength
      ) {
        formattedChannels[extendChannelIndex - 1] =
          channelsName[extendChannelIndex - 1]
        extendChannelIndex--
      }
      if (formattedChannels.join('/').length > maxPathLength) {
        let shortenChannelIndex = extendChannelIndex
        while (
          formattedChannels.join('/').length > maxPathLength &&
          shortenChannelIndex < channelsSimple.length - 2
        ) {
          formattedChannels[shortenChannelIndex] = ChannelIdToUniqueInital(
            channelsId[shortenChannelIndex] ?? ''
          )
          shortenChannelIndex++
        }
        if (formattedChannels.join('/').length <= maxPathLength) {
          return (hashed ? '#' : '') + formattedChannels.join('/')
        }
        let replaceInitialChannelIndex = extendChannelIndex
        while (
          formattedChannels.join('/').length > maxPathLength &&
          replaceInitialChannelIndex < channelsSimple.length - 2
        ) {
          formattedChannels[replaceInitialChannelIndex] =
            channelsInit[replaceInitialChannelIndex]
          replaceInitialChannelIndex++
        }
        if (formattedChannels.join('/').length <= maxPathLength) {
          return (hashed ? '#' : '') + formattedChannels.join('/')
        }
        formattedChannels[channelsSimple.length - 2] = ChannelIdToUniqueInital(
          channelsId[channelsSimple.length - 2] ?? ''
        )
        return (hashed ? '#' : '') + formattedChannels.join('/')
      } else {
        return (hashed ? '#' : '') + formattedChannels.join('/')
      }
    } else if (channelsId.length === 1) {
      const path = channelsName[0]
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

