import type { ChannelId, DMChannelId } from '/@/types/entity-ids'
import { constructUserPath, constructChannelPath } from '/@/router'
import type { SimpleChannel } from '/@/lib/channel'
import { channelIdToSimpleChannelPath as libChannelIdToSimpleChannelPath } from '/@/lib/channel'
import { channelPathToId } from '/@/lib/channelTree'
import { useChannelsStore } from '/@/store/entities/channels'
import { useUsersStore } from '../store/entities/users'
import { useChannelTree } from '/@/store/domain/channelTree'

const MAX_SHORT_PATH_LENGTH = 20

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
  /**
   * 文字列 target が、candidates の中で他の文字列と区別できるようになるために必要な最短の接頭辞を求める
   */
  const getShortestUniqueInitial = (
    candidates: string[],
    target: string
  ): string => {
    let restCandidates: string[] = candidates.filter(c => c !== target)
    for (let i = 0; i < target.length; i++) {
      restCandidates = restCandidates.filter(word => word[i] === target[i])
      if (restCandidates.length === 0) {
        return target.slice(0, i + 1)
      }
    }
    return target
  }

  /**
   * Siblingは自分自身を含まない、アーカイブされていないチャンネルのみ返す
   */
  const channelIdToSiblingIds = (id: ChannelId): ChannelId[] => {
    const self = channelsMap.value.get(id)
    if (self === undefined) {
      return []
    }
    if (self.parentId === null) {
      return topLevelChannels.value
        .filter(c => !c.archived && c.id !== id)
        .map(c => c.id)
    }
    const parentChannel = channelsMap.value.get(self.parentId)
    if (parentChannel === undefined) {
      throw `channelIdToSiblingIds: No parents ${id}`
    }
    return (
      parentChannel.children.filter(
        c => !(channelsMap.value.get(c)?.archived ?? true) && c !== id
      ) ?? []
    )
  }

  /**
   * (トップレベルチャンネルに使うとエラーを投げる)
   */
  const checkHavingSameNameCousin = (id: ChannelId): boolean => {
    const self = channelsMap.value.get(id)
    if (self === undefined) {
      throw `checkHavingSameNameCousin: No channel: ${id}`
    }
    const selfName = self.name
    const parentId = self.parentId
    if (parentId === null) {
      throw `checkHavingSameNameCousin: No parent channel: ${id}`
    }
    const parentSiblingIds = channelIdToSiblingIds(parentId)
    for (const parentSiblingId of parentSiblingIds) {
      const cousinIds = channelsMap.value.get(parentSiblingId)?.children ?? []
      for (const cousinId of cousinIds) {
        const cousinName = channelsMap.value.get(cousinId)?.name
        if (cousinName === selfName) {
          return true
        }
      }
    }
    return false
  }

  const channelIdToUniqueInitial = (id: string): string => {
    const selfName = channelsMap.value.get(id)?.name
    if (selfName === undefined) {
      throw `ChannelIdToUniqueInitial: No Channel ${id}`
    }
    const SiblingIds = channelIdToSiblingIds(id)
    const SiblingNames = SiblingIds.map(
      c => channelsMap.value.get(c)?.name
    ).filter(c => c !== undefined)
    return getShortestUniqueInitial(SiblingNames, selfName)
  }

  const channelIdToShortPathString = (
    id: ChannelId | DMChannelId,
    hashed = false
  ): string => {
    if (dmChannelsMap.value.has(id)) {
      return dmChannelIdToPathString(id, hashed)
    }

    if (!channelsMap.value.has(id)) {
      throw `channelIdToShortPathString: No channel: ${id}`
    }
    const simpleChannels = channelIdToSimpleChannelPath(id)
    const channelsLength = simpleChannels.length
    if (channelsLength === 0) {
      return hashed ? '#' : ''
    } else if (channelsLength === 1) {
      const channelNames = simpleChannels.map(c => c.name)
      const path = channelNames[0]
      return (hashed ? '#' : '') + path
    }

    const channelIds = simpleChannels.map(c => c.id)
    const channelNames = simpleChannels.map(c => c.name)
    const channelInitials = channelNames.map(c => c[0] ?? '')

    // r/g/p/child
    const primitiveChannels = [
      ...channelInitials.slice(0, -1),
      channelNames[channelsLength - 1] ?? ''
    ]
    if (primitiveChannels.join('/').length >= MAX_SHORT_PATH_LENGTH) {
      return (hashed ? '#' : '') + primitiveChannels.join('/')
    }

    const expandChannels = (channels: string[]): string[] => {
      const expandedChannels = channels.concat()
      // その名前のいとこチャンネルがいないかを検査するべきチャンネルのindex
      // いる場合はその一つ上を展開する
      let checkChannelIndex = channelsLength - 1
      while (
        checkChannelIndex > 0 &&
        checkHavingSameNameCousin(channelIds[checkChannelIndex] ?? '') &&
        expandedChannels.join('/').length < MAX_SHORT_PATH_LENGTH
      ) {
        const indexParentName = channelNames[checkChannelIndex - 1]
        if (indexParentName !== undefined) {
          expandedChannels[checkChannelIndex - 1] = indexParentName
        }
        checkChannelIndex--
      }
      return expandedChannels
    }

    // r/grand-parent/parent/child
    const expandedChannels = expandChannels(primitiveChannels)
    if (expandedChannels.join('/').length <= MAX_SHORT_PATH_LENGTH) {
      return (hashed ? '#' : '') + expandedChannels.join('/')
    }

    const cutChannels = (channels: string[]): string[] => {
      const cuttedChannels = channels.concat()
      // そのチャンネルを短縮するか判定するindex
      let cutIndex = 0
      while (
        cuttedChannels.join('/').length > MAX_SHORT_PATH_LENGTH &&
        cutIndex < channelsLength - 2
      ) {
        const indexUniqueInitial = channelIdToUniqueInitial(
          channelIds[cutIndex] ?? ''
        )
        // expandされたチャンネルのみを対象にする
        if ((cuttedChannels[cutIndex] ?? '').length >= 2) {
          cuttedChannels[cutIndex] = indexUniqueInitial
        }
        cutIndex++
      }
      return cuttedChannels
    }

    // r/grand-/parent/child
    const cuttedChannels = cutChannels(expandedChannels)
    if (cuttedChannels.join('/').length <= MAX_SHORT_PATH_LENGTH) {
      return (hashed ? '#' : '') + cuttedChannels.join('/')
    }

    const replaceInitialChannels = (channels: string[]): string[] => {
      const replaceInitialChannels = channels.concat()
      let replaceInitialIndex = 0
      while (
        replaceInitialChannels.join('/').length > MAX_SHORT_PATH_LENGTH &&
        replaceInitialIndex < channelsLength - 2
      ) {
        const indexinitial = channelInitials[replaceInitialIndex]
        if (indexinitial !== undefined) {
          replaceInitialChannels[replaceInitialIndex] = indexinitial
        }
        replaceInitialIndex++
      }
      return replaceInitialChannels
    }

    // r/g/parent/child
    const replacedInitialChannels = replaceInitialChannels(cuttedChannels)
    if (replacedInitialChannels.join('/').length <= MAX_SHORT_PATH_LENGTH) {
      return (hashed ? '#' : '') + replacedInitialChannels.join('/')
    }

    // r/g/pa/child
    return (
      (hashed ? '#' : '') +
      [
        ...replacedInitialChannels.slice(0, -2),
        channelIdToUniqueInitial(channelIds[channelsLength - 2] ?? ''),
        replacedInitialChannels[channelsLength - 1]
      ].join('/')
    )
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
