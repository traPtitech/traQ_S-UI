import type { Word } from './types'

/** 区切りを入力する前から子の候補を表示する。 */
export const channelSuggestions = (
  prefix: string,
  search: (prefix: string) => Word[]
) => {
  const matches = search(prefix)

  const exact = matches.find(
    word => word.text.toLocaleLowerCase() === prefix.toLocaleLowerCase()
  )

  const children = exact ? search(`${exact.text}/`) : []

  return {
    words: children.length ? children : matches,
    parentChannel: children.length ? exact : undefined
  }
}
