import { lastIndexOf } from '/@/lib/basic/string'

export type Target = {
  word: string
  begin: number
  end: number
}

export const getCurrentWord = (
  elm: { selectionStart: number; selectionEnd: number },
  text: string
): Target => {
  const startIndex = elm.selectionStart
  const nearest = lastIndexOf(text, ['@', ':', '.', '#'], startIndex - 1)
  const prevSpaceIndex = lastIndexOf(text, [' ', '　'], startIndex - 1)
  if (prevSpaceIndex > nearest) {
    return { word: '', begin: 0, end: 0 }
  }

  const begin = Math.max(nearest, 0)
  const end = elm.selectionEnd
  const word = text.slice(begin, end)
  return { word, begin, end }
}

export const getDeterminedCharacters = (_candidates: string[]) => {
  if (_candidates.length <= 0) return ''
  if (_candidates[0] === undefined) return ''

  const candidates = _candidates.map(candidate => [...candidate])

  const minLength = Math.min(...candidates.map(({ length }) => length))
  const confirmedPart: string[] = []

  for (let i = 0; i < minLength; i++) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    confirmedPart[i] = candidates[0]![i]!

    for (const candidate of candidates) {
      if (confirmedPart[i] !== candidate[i]) {
        // candidates に大文字と小文字の両方が存在する場合は小文字にする
        confirmedPart[i] = confirmedPart[i]?.toLocaleLowerCase() as string

        if (confirmedPart[i] !== candidate[i]?.toLocaleLowerCase()) {
          return confirmedPart.slice(0, -1).join('')
        }
      }
    }
  }

  return confirmedPart.join('')
}

export const getPrevCandidateIndex = (
  list: readonly unknown[],
  selectedIndex: number | null
) => {
  if (selectedIndex === null) {
    // 候補が一件のときは確定部分ではなく候補のほうを返す
    // こうすると大文字小文字が元のものになる
    if (list.length === 1) {
      return 0
    }
    return -1
  }
  if (selectedIndex <= -1) {
    return list.length - 1
  }
  return selectedIndex - 1
}

export const getNextCandidateIndex = (
  list: readonly unknown[],
  selectedIndex: number | null
) => {
  if (selectedIndex === null) {
    // 候補が一件のときは確定部分ではなく候補のほうを返す
    // こうすると大文字小文字が元のものになる
    if (list.length === 1) {
      return 0
    }
    return -1
  }
  if (selectedIndex >= list.length - 1) {
    return -1
  }
  return selectedIndex + 1
}
