import { lastIndexOf } from '/@/lib/basic/string'

interface WordBase {
  delimiter?: string
  text: string
}

export interface WordWithId extends WordBase {
  type: 'user' | 'user-group' | 'stamp' | 'channel'
  id: string
}

export interface WordWithoutId extends WordBase {
  type: 'stamp-effect'
}

export type Word = WordWithId | WordWithoutId

export type WordOrConfirmedPart =
  | Word
  | {
      type: 'confirmed-part'
      text: string
    }

export interface Candidate {
  word: Word
  display?: string
}

export interface ConfirmedPart {
  text: string
  display?: string
}

export type Target = {
  word: string
  begin: number
  end: number
}

export const getCurrentWord = ({
  value: text,
  selectionStart,
  selectionEnd
}: Pick<
  HTMLTextAreaElement,
  'value' | 'selectionStart' | 'selectionEnd'
>): Target => {
  const nearest = lastIndexOf(text, ['@', ':', '.', '#'], selectionStart - 1)
  const prevSpaceIndex = lastIndexOf(text, [' ', '　'], selectionStart - 1)
  if (prevSpaceIndex > nearest) {
    return { word: '', begin: 0, end: 0 }
  }

  const begin = Math.max(nearest, 0)
  const word = text.slice(begin, selectionEnd)
  return { word, begin, end: selectionEnd }
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

export const getSelectedCandidateIndex = (
  list: readonly Word[],
  confirmed: string,
  word: string | null
) => {
  const index = list.findIndex(c => c.text === word)
  if (index >= 0) return index
  if (confirmed === word) return -1
  return null
}

export const getPrevCandidateIndex = (
  length: number,
  selectedIndex: number | null
) => {
  if (selectedIndex === null) {
    // 候補が一件のときは確定部分ではなく候補のほうを返す
    // 候補にはアイコンやスタンプが表示されている
    if (length === 1) return 0
    return -1
  }
  if (selectedIndex < 0) return length - 1
  return selectedIndex - 1
}

export const getNextCandidateIndex = (
  length: number,
  selectedIndex: number | null
) => {
  if (selectedIndex === null) {
    // 候補が一件のときは確定部分ではなく候補のほうを返す
    // 候補にはアイコンやスタンプが表示されている
    if (length === 1) return 0
    return -1
  }
  if (selectedIndex >= length - 1) return -1
  return selectedIndex + 1
}
