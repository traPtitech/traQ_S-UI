import { UserGroupId, UserId } from '@/types/entity-ids'

interface StructData {
  type: string
  raw: string
  id: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isStructData = (data: any): data is StructData =>
  typeof data['type'] === 'string' &&
  typeof data['raw'] === 'string' &&
  typeof data['id'] === 'string'

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

const makeDectector = (text: string, checker: (text: string) => boolean) => {
  let isInside = false
  let startIndex = -1
  let isString = false
  const ret = []
  for (let i = 0; i < text.length; i++) {
    if (isInside) {
      if (text[i] === '"') {
        if (isString) isString = false
        else isString = true
      } else if (!isString && text[i] === '}') {
        isInside = false
        if (checker(text.substr(startIndex + 1, i - startIndex))) {
          ret.push(JSON.parse(text.substr(startIndex + 1, i - startIndex)))
        } else {
          i = startIndex + 1
        }
      }
    } else {
      if (i < text.length - 1 && text[i] === '!' && text[i + 1] === '{') {
        startIndex = i
        i++
        isInside = true
        isString = false
      }
    }
  }
  return ret
}

const isMentionOfMe = (
  myId: UserId,
  myGroupIds: UserGroupId[],
  data: StructData | null
) => {
  if (data === null) return false
  if (data.type === 'user' && data.id === myId) return true
  if (data.type === 'group' && myGroupIds.includes(data.id)) return true
  return false
}

export const detectMentionOfMe = (
  text: string,
  myId: UserId,
  myGroupIds: UserGroupId[]
) => {
  return makeDectector(text, text =>
    isMentionOfMe(myId, myGroupIds, parse(text))
  )
}
