import TrieTree from '/@/lib/basic/trieTree'
import { channelSuggestions } from '/@/lib/suggestion/channel'
import type { ChannelWord } from '/@/lib/suggestion/types'

const words = (...paths: string[]): ChannelWord[] =>
  paths.map((text, index) => ({
    type: 'channel',
    id: String(index),
    text,
    delimiter: '/'
  }))

describe('channel path completion', () => {
  const channels = words(
    '#team',
    '#team/SysAd',
    '#team/SysDev',
    '#team/SysAd/Client',
    '#teammate'
  )

  const tree = new TrieTree(channels)
  const search = (prefix: string) =>
    tree.search(prefix, { stopAtNextDelimiter: true })

  it('offers only the next hierarchy for a partial path', () => {
    const result = channelSuggestions('#te', search)

    expect(result.words.map(word => word.text)).toEqual(['#team', '#teammate'])
    expect(result.parentChannel).toBeUndefined()
  })

  it('offers children for an exact parent while retaining it as a confirmation target', () => {
    const result = channelSuggestions('#TEAM', search)

    expect(result.words.map(word => word.text)).toEqual([
      '#team/SysAd',
      '#team/SysDev'
    ])
    expect(result.parentChannel).toEqual(channels[0])
  })

  it('keeps leaves and unknown paths in normal prefix completion', () => {
    expect(channelSuggestions('#team/SysAd/Client', search)).toEqual({
      words: [channels[3]],
      parentChannel: undefined
    })
    expect(channelSuggestions('#missing', search)).toEqual({
      words: [],
      parentChannel: undefined
    })
  })
})
