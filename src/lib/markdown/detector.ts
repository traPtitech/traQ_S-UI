import type { UserGroupId, UserId } from '/@/types/entity-ids'

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

const isStructData = (data: Readonly<unknown>): data is StructData => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyData = data as any
  return (
    typeof anyData['type'] === 'string' &&
    typeof anyData['raw'] === 'string' &&
    typeof anyData['id'] === 'string'
  )
}

const parse = (str: string): StructData | null => {
  try {
    const data = JSON.parse(str)
    if (!isStructData(data)) {
      return null
    }
    return data
  } catch {
    return null
  }
}

type ForEachDataState =
  | 'outside' // !{}の外
  | 'inside' // !{}の中
  | 'insideString' // !{}の中の文字列の中

/**
 * https://github.com/traPtitech/traQ/blob/master/utils/message/parser.go と検知できるものをあわせること
 * https://github.com/traPtitech/traQ_S-UI/pull/3515 の図を参照
 *
 * @param shortcut funcがtrueまたはfalseを返すときに即時に実行を終わるかどうか(nullのときは行わない)
 * @returns shortcutした場合はその値、そうでない場合はnull
 */
export const forEachData = (
  text: string,
  func: (
    data: Readonly<StructData> | null,
    position: Position
  ) => boolean | void,
  shortcut: boolean | null = null
) => {
  let state: ForEachDataState = 'outside'
  let startIndex = -1

  for (let i = 0; i < text.length; i++) {
    switch (state) {
      case 'outside': {
        if (i < text.length - 1 && text[i] === '!' && text[i + 1] === '{') {
          state = 'inside'
          startIndex = i
          i++
        }
        break
      }
      case 'inside': {
        if (text[i] === '"') {
          state = 'insideString'
        } else if (text[i] === '}') {
          state = 'outside'
          const jsonString = text.slice(startIndex + 1, i + 1) // `{`から`}`まで
          const data = parse(jsonString)
          const result = func(data, {
            start: startIndex,
            length: i - startIndex + 1
          })
          // funcはbooleanかundefinedなのでnullとは一致しない
          if (result === shortcut) {
            return result
          }
        }
        break
      }
      case 'insideString': {
        if (text[i] === '"') {
          state = 'inside'
        }
        break
      }
    }
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
