import type { UserGroupId, UserId } from '/@/types/entity-ids'

import { embeddingTokens } from './embeddingTokens'

interface StructData {
  type: string
  raw: string
  id: string
}

export interface Position {
  /**
   * !{}の!の位置
   */
  start: number
  /**
   * !から}までの長さ
   */
  length: number
}

const isStructData = (value: unknown): value is StructData => {
  if (!value || typeof value !== 'object') return false

  return (
    'type' in value &&
    typeof value.type === 'string' &&
    'raw' in value &&
    typeof value.raw === 'string' &&
    'id' in value &&
    typeof value.id === 'string'
  )
}

/**
 * https://github.com/traPtitech/traQ/blob/master/utils/message/parser.go と検知できるものをあわせること
 * https://github.com/traPtitech/traQ_S-UI/pull/3515 の図を参照
 *
 * @param shortcut funcがtrueまたはfalseを返すときに即時に実行を終わるかどうか(nullのときは行わない)
 * @returns shortcutした場合はその値、そうでない場合はundefined
 */
export const forEachData = (
  text: string,
  func: (
    data: Readonly<StructData> | null,
    position: Position
  ) => boolean | void,
  shortcut: boolean | null = null
) => {
  for (const token of embeddingTokens(text)) {
    const result = func(isStructData(token.value) ? token.value : null, {
      start: token.start,
      length: token.length
    })

    if (result === shortcut) return result
  }

  return undefined
}

const detect = (
  text: string,
  checker: (data: Readonly<StructData> | null) => boolean
) => {
  return forEachData(text, checker, true) ?? false
}

const isMentionOfMe = (
  myId: UserId,
  myGroupIds: readonly UserGroupId[],
  data: Readonly<StructData> | null
) => {
  if (data === null) return false
  if (data.type === 'user' && data.id === myId) return true
  if (data.type === 'group' && myGroupIds.includes(data.id)) return true
  return false
}

export const detectMentionOfMe = (
  text: string,
  myId: UserId,
  myGroupIds: readonly UserGroupId[]
) => detect(text, data => isMentionOfMe(myId, myGroupIds, data))
