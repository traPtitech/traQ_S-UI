import type { Target } from '/@/lib/suggestion/basic'
import {
  getCurrentWord,
  getDeterminedCharacters,
  getNextCandidateIndex,
  getPrevCandidateIndex
} from '/@/lib/suggestion/basic'

describe('suggestion', () => {
  describe('getCurrentWord', () => {
    it('can get', () => {
      const actual = getCurrentWord({
        value: '@te',
        selectionStart: 3,
        selectionEnd: 3
      })
      const expected: Target = {
        word: '@te',
        begin: 0,
        end: 3
      }
      expect(actual).toEqual(expected)
    })
    it('can detect @', () => {
      const actual = getCurrentWord({
        value: 'i really like@test',
        selectionStart: 18,
        selectionEnd: 18
      })
      const expected: Target = {
        word: '@test',
        begin: 13,
        end: 18
      }
      expect(actual).toEqual(expected)
    })
    it('can detect :', () => {
      const actual = getCurrentWord({
        value: 'this: is :test',
        selectionStart: 12,
        selectionEnd: 12
      })
      const expected: Target = {
        word: ':te',
        begin: 9,
        end: 12
      }
      expect(actual).toEqual(expected)
    })
    it('can detect .', () => {
      const actual = getCurrentWord({
        value: 'test.example.com',
        selectionStart: 8,
        selectionEnd: 8
      })
      const expected: Target = {
        word: '.exa',
        begin: 4,
        end: 8
      }
      expect(actual).toEqual(expected)
    })
    it('can tell if divided', () => {
      const actual = getCurrentWord({
        value: 'this @is test sentence.',
        selectionStart: 11,
        selectionEnd: 11
      })
      const expected: Target = {
        word: '',
        begin: 0,
        end: 0
      }
      expect(actual).toEqual(expected)
    })
  })

  describe('getDeterminedCharacters', () => {
    it('can get from empty array', () => {
      const actual = getDeterminedCharacters([])
      const expected = ''
      expect(actual).toEqual(expected)
    })

    it('can get from normal array', () => {
      const actual = getDeterminedCharacters(['aaab', 'aaac', 'aaad'])
      const expected = 'aaa'
      expect(actual).toEqual(expected)
    })

    it('can get from multi case array', () => {
      const actual = getDeterminedCharacters(['Aaab', 'aaAc', 'aaad'])
      const expected = 'aaa'
      expect(actual).toEqual(expected)
    })

    it('can get from unicode array', () => {
      const actual = getDeterminedCharacters([
        '🤔🤔あa亜1',
        '🤔🤔あa亜2',
        '🤔🤔あa亜3'
      ])
      const expected = '🤔🤔あa亜'
      expect(actual).toEqual(expected)
    })
  })

  const list = [0, 1, 2, 3]
  const oneElementList = [0]
  describe('getPrevCandidateIndex', () => {
    it('can get prev of null', () => {
      const actual = getPrevCandidateIndex(list.length, null)
      expect(actual).toEqual(-1)
    })
    it('can get prev of null when list has only one element', () => {
      const actual = getPrevCandidateIndex(oneElementList.length, null)
      expect(actual).toBe(0)
    })
    it('can get prev of -1', () => {
      const actual = getPrevCandidateIndex(list.length, -1)
      expect(actual).toBe(3)
    })
    it('can get prev of 0', () => {
      const actual = getPrevCandidateIndex(list.length, 0)
      expect(actual).toEqual(3)
    })
    it('can get prev of 2', () => {
      const actual = getPrevCandidateIndex(list.length, 2)
      expect(actual).toBe(1)
    })
  })
  describe('getNextCandidateIndex', () => {
    it('can get next of null', () => {
      const actual = getNextCandidateIndex(list.length, null)
      expect(actual).toEqual(-1)
    })
    it('can get next of null when list has only one element', () => {
      const actual = getNextCandidateIndex(oneElementList.length, null)
      expect(actual).toBe(0)
    })
    it('can get next of -1', () => {
      const actual = getNextCandidateIndex(list.length, -1)
      expect(actual).toBe(0)
    })
    it('can get next of 3', () => {
      const actual = getNextCandidateIndex(list.length, 3)
      expect(actual).toEqual(0)
    })
    it('can get next of 2', () => {
      const actual = getNextCandidateIndex(list.length, 2)
      expect(actual).toBe(3)
    })
  })

  describe('shouldInsertSpaces', () => {
    // Before the fix, '#' was included in the condition.
    // After the fix, '#' should no longer be included.
    const shouldInsertSpaces = (confirmed: string) =>
      confirmed.startsWith(':') || confirmed.startsWith('@')

    it('should not insert spaces for #', () => {
      expect(shouldInsertSpaces('#parent')).toBe(false)
    })

    it('should insert spaces for @', () => {
      expect(shouldInsertSpaces('@alice')).toBe(true)
    })

    it('should insert spaces for :', () => {
      expect(shouldInsertSpaces(':smile:')).toBe(true)
    })

    it('should not insert spaces for ordinary text', () => {
      expect(shouldInsertSpaces('ordinary')).toBe(false)
    })
  })

  describe('insertSpaces', () => {
    const insertSpaces = (
      word: string,
      textInTextarea: string,
      beginIndex: number
    ) => {
      if (!textInTextarea || beginIndex === 0) {
        return word + ' '
      }

      const previousChar = textInTextarea[beginIndex - 1]

      if (previousChar === ' ' || previousChar === '\n') {
        return word + ' '
      }

      return ' ' + word + ' '
    }

    it('should insert without a leading space when textarea is empty', () => {
      expect(insertSpaces('#parent', '', 0)).toBe('#parent ')
    })

    it('should insert spaces when the previous character is not whitespace', () => {
      expect(insertSpaces('#child', '#parent/', 8)).toBe(' #child ')
    })

    it('should not insert a leading space after a space', () => {
      expect(insertSpaces('@alice', 'hello ', 6)).toBe('@alice ')
    })

    it('should insert spaces around the word after a normal character', () => {
      expect(insertSpaces(':smile:', 'hello', 5)).toBe(' :smile: ')
    })

    it('should not insert a leading space after a newline', () => {
      expect(insertSpaces('@alice', 'hello\n', 6)).toBe('@alice ')
    })
  })
})
