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
    it('can detect @', () => {
      const actual = getCurrentWord(
        { selectionStart: 18, selectionEnd: 18 },
        'i really like@test'
      )
      const expected: Target = {
        word: '@test',
        begin: 13,
        end: 18,
        divided: false
      }
      expect(actual).toEqual(expected)
    })
    it('can detect :', () => {
      const actual = getCurrentWord(
        { selectionStart: 12, selectionEnd: 12 },
        'this: is :test'
      )
      const expected: Target = {
        word: ':te',
        begin: 9,
        end: 12,
        divided: false
      }
      expect(actual).toEqual(expected)
    })
    it('can detect .', () => {
      const actual = getCurrentWord(
        { selectionStart: 8, selectionEnd: 8 },
        'test.example.com'
      )
      const expected: Target = {
        word: '.exa',
        begin: 4,
        end: 8,
        divided: false
      }
      expect(actual).toEqual(expected)
    })
    it('can tell if divided', () => {
      const actual = getCurrentWord(
        { selectionStart: 11, selectionEnd: 11 },
        'this @is test sentence.'
      )
      const expected: Target = {
        word: '@is te',
        begin: 5,
        end: 11,
        divided: true
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
})
