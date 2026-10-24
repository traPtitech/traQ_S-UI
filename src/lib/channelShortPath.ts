import type { Channel } from '@traptitech/traq'

import { channelIdToSimpleChannelPath } from '/@/lib/channel'
import type { ChannelId } from '/@/types/entity-ids'

const MAX_SHORT_PATH_LENGTH = 20

// チャンネル ID とは衝突しない
const ROOT_KEY = ''

/**
 * 文字列 target が、candidates の中で他の文字列と区別できるようになるために必要な最短の接頭辞を求める
 */
const getShortestUniqueInitial = (candidates: string[], target: string) => {
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
 * 行ごとに兄弟やいとこを走査すると重いので、一覧を 1 回なめて索引を作り、各チャンネルでは索引を引くだけにする
 */
export const createShortPathResolver = (
  channelsMap: ReadonlyMap<ChannelId, Channel>
) => {
  const cousinKey = (
    grandparentId: ChannelId | null | undefined,
    name: string
  ) => `${grandparentId ?? ROOT_KEY}/${name}`

  // (祖父母, 名前) → その組を持ち、親がアーカイブされていないチャンネルの数
  const cousinKeyCount = new Map<string, number>()
  // 親 → アーカイブされていない子の名前
  const siblingNames = new Map<string, string[]>([[ROOT_KEY, []]])

  for (const channel of channelsMap.values()) {
    if (!channel.parentId && !channel.archived) {
      siblingNames.get(ROOT_KEY)?.push(channel.name)
    }

    const children = channel.children
      .map(id => channelsMap.get(id))
      .filter(child => child !== undefined)
    siblingNames.set(
      channel.id,
      children.filter(child => !child.archived).map(child => child.name)
    )

    if (channel.archived) continue
    for (const child of children) {
      const key = cousinKey(channel.parentId, child.name)
      cousinKeyCount.set(key, (cousinKeyCount.get(key) ?? 0) + 1)
    }
  }

  /**
   * (トップレベルチャンネルに使うとエラーを投げる)
   */
  const checkHavingSameNameCousin = (id: ChannelId) => {
    const self = channelsMap.get(id)
    if (self === undefined) {
      throw new Error(`checkHavingSameNameCousin: No channel: ${id}`)
    }
    const selfName = self.name
    const parentId = self.parentId
    if (parentId === null) {
      throw new Error(`checkHavingSameNameCousin: No parent channel: ${id}`)
    }
    const parent = channelsMap.get(parentId)
    if (parent === undefined) {
      return false
    }
    const count = cousinKeyCount.get(cousinKey(parent.parentId, selfName)) ?? 0
    // 親がアーカイブされていなければ、自分自身も数えられている
    return count - (parent.archived ? 0 : 1) > 0
  }

  const channelIdToUniqueInitial = (id: string) => {
    const selfName = channelsMap.get(id)?.name
    if (selfName === undefined) {
      throw new Error(`ChannelIdToUniqueInitial: No Channel ${id}`)
    }
    const SiblingNames =
      siblingNames.get(channelsMap.get(id)?.parentId ?? ROOT_KEY) ?? []
    return getShortestUniqueInitial(SiblingNames, selfName)
  }

  const channelIdToShortPathString = (id: ChannelId, hashed = false) => {
    const simpleChannels = channelIdToSimpleChannelPath(id, channelsMap)

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
    const channelShortenedNames = channelNames.map(name =>
      name.length <= 2 ? name : (name[0] ?? '')
    )

    // r/g/p/child
    const primitiveChannels = [
      ...channelShortenedNames.slice(0, -1),
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

    const shortenChannels = (channels: string[]): string[] => {
      const shortenedChannels = channels.concat()
      // そのチャンネルを短縮するか判定するindex
      let cutIndex = 0
      while (
        shortenedChannels.join('/').length > MAX_SHORT_PATH_LENGTH &&
        cutIndex < channelsLength - 2
      ) {
        const indexUniqueInitial = channelIdToUniqueInitial(
          channelIds[cutIndex] ?? ''
        )
        // expandされたチャンネルのみを対象にする
        if ((shortenedChannels[cutIndex] ?? '').length >= 2) {
          shortenedChannels[cutIndex] = indexUniqueInitial
        }
        cutIndex++
      }
      return shortenedChannels
    }

    // r/grand-/parent/child
    const shortenedChannels = shortenChannels(expandedChannels)
    if (shortenedChannels.join('/').length <= MAX_SHORT_PATH_LENGTH) {
      return (hashed ? '#' : '') + shortenedChannels.join('/')
    }

    const replaceInitialChannels = (channels: string[]): string[] => {
      const replaceInitialChannels = channels.concat()
      let replaceInitialIndex = 0
      while (
        replaceInitialChannels.join('/').length > MAX_SHORT_PATH_LENGTH &&
        replaceInitialIndex < channelsLength - 2
      ) {
        const initialIndex = channelShortenedNames[replaceInitialIndex]
        if (initialIndex !== undefined) {
          replaceInitialChannels[replaceInitialIndex] = initialIndex
        }
        replaceInitialIndex++
      }
      return replaceInitialChannels
    }

    // r/g/parent/child
    const replacedInitialChannels = replaceInitialChannels(shortenedChannels)
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

  return channelIdToShortPathString
}
