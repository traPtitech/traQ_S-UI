import { forEachData } from '/@/lib/markdown/detector'
import { embeddingTokens } from '/@/lib/markdown/embeddingTokens'
import { encodeReference, parseInput, serializeInput } from '/@/lib/references'

const reference = { type: 'user', id: 'selected-id', raw: '@a"}b\\c' } as const

describe('embedding token boundaries', () => {
  it.each([
    '',
    '!{broken} ',
    '!{'.repeat(32_000),
    '!{"raw":"unfinished\n',
    '!{"type":"future","nested":{"value":"!{literal}"}} '
  ])('recovers after an invalid or unknown prefix', prefix => {
    const encoded = encodeReference(reference)
    const source = prefix + encoded
    const tokens = [...embeddingTokens(source)]

    expect(tokens.at(-1)).toMatchObject({
      start: prefix.length,
      source: encoded,
      value: reference
    })
    expect(serializeInput(parseInput(source, 'message'))).toBe(source)
    const visits: Array<{ start: number; raw: string }> = []

    forEachData(source, (data, position) => {
      if (data) visits.push({ start: position.start, raw: data.raw })
    })

    expect(visits).toEqual([{ start: prefix.length, raw: reference.raw }])
  })

  it('does not tokenize a marker inside a JSON string', () => {
    const source = encodeReference({ ...reference, raw: '@!{"quoted"}' })
    expect([...embeddingTokens(source)]).toHaveLength(1)
    expect(parseInput(source, 'message')).toHaveLength(1)
  })
})
