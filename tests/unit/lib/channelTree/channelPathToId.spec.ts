import { channelPathToId, ChannelTree } from '/@/lib/channelTree'

describe('channelPathToId', () => {
  it('can get id', () => {
    const actual = channelPathToId(['a', 'b'], channelTree)
    expect(actual).toBe('b')
  })

  it('cannot get from empty array', () => {
    expect(() => {
      channelPathToId([], channelTree)
    }).toThrow('Empty path')
  })
})

const channelTree: ChannelTree = {
  children: [
    {
      id: 'a',
      name: 'a',
      active: true,
      archived: false,
      children: [
        {
          id: 'b',
          name: 'b',
          active: true,
          archived: false,
          children: []
        }
      ]
    }
  ]
}
