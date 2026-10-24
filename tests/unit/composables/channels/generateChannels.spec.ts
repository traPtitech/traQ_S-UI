import { isValidChannelName } from '/@/lib/validate'

import { generateChannels } from './generateChannels'

describe('generateChannels', () => {
  const channels = generateChannels({ seed: 1, size: 2000 })

  test('all names satisfy the channel name rules', () => {
    expect(channels.filter(c => !isValidChannelName(c.name))).toEqual([])
  })

  test('sibling names are unique ignoring case', () => {
    const siblingKeys = channels.map(
      c => `${c.parentId}/${c.name.toLowerCase()}`
    )

    expect(new Set(siblingKeys).size).toBe(channels.length)
  })
})
