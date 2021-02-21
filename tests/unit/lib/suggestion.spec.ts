import {
  getCurrentWord,
  getDeterminedCharacters,
  Target
} from '@/lib/suggestion'

describe('suggestion', () => {
  describe('getCurrentWord', () => {
    it('can get', () => {
      const actual = getCurrentWord(
        { selectionStart: 3, selectionEnd: 3 },
        '@te'
      )
      const expected: Target = {
        word: '@te',
        begin: 0,
        end: 3,
        divided: false
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
})
