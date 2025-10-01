import type { StoreForParser } from '/@/lib/searchMessage/parserBase'
import {
  createQueryParser,
  toSearchMessageParam
} from '/@/lib/searchMessage/queryParser'

const mockMessageId = 'message-id'
const mockMessageUrl = `https://example.com/messages/${mockMessageId}`
const mockChannelId = 'channel-id'
const mockDmChannelId = 'dm-channel-id'
const mockChannelName = 'general'
const mockUserId = 'user-id'
const mockUserName = 'user'
const mockUserGroupIds = ['user-group-id-00', 'user-group-id-01']
const mockUserGroupNames = ['user-group-00', 'user-group-01']
const mockCurrentChannelPath = 'current/channel'
const mockCurrentChannelId = 'current-channel-id'
const mockCurrentUsername = 'currentUser'
const mockCurrentUserDmChannelId = 'current-user-dm-channel-id'
const mockMyUserId = 'my-user-id'
const mockMyDmChannelId = 'my-dm-channel-id'
const mockMyUsername = 'myUsername'

const store: StoreForParser = {
  channelPathToId: channelPath => {
    if (channelPath === mockChannelName) {
      return mockChannelId
    }
    if (channelPath === mockCurrentChannelPath) {
      return mockCurrentChannelId
    }
    return undefined
  },
  usernameToDmChannelId: async username => {
    if (username === mockUserName) {
      return mockDmChannelId
    }
    if (username === mockCurrentUsername) {
      return mockCurrentUserDmChannelId
    }
    return undefined
  },
  usernameToId: username => {
    if (username === mockUserName) {
      return mockUserId
    }
    if (username === mockMyUsername) {
      return mockMyUserId
    }
    return undefined
  },
  userIdToName: userId => {
    if (userId === mockUserId) {
      return mockUserName
    }
    if (userId === mockMyUserId) {
      return mockMyUsername
    }
    return undefined
  },
  userGroupNameToId: async name => {
    const idx = mockUserGroupNames.indexOf(name)
    if (idx === -1) return undefined
    return mockUserGroupIds[idx]
  },
  userGroupIdToUserIds: groupId => {
    const idx = mockUserGroupIds.indexOf(groupId)
    if (idx === -1) return undefined
    if (idx === 0) return [mockUserId, mockMyUserId]
    return [mockUserId]
  },
  userIdToUserGroupIds: userId => {
    if (userId === mockUserId) {
      return mockUserGroupIds
    }
    if (userId === mockMyUserId) {
      return [mockUserGroupIds[0] as string]
    }
    return []
  },
  getCurrentChannelId: () => mockCurrentChannelId,
  getMyDmChannelId: () => mockMyDmChannelId,
  getMyUserId: () => mockMyUserId,
  getCurrentChannelPathOrUsername: () => mockCurrentChannelPath,
  getMyUsername: () => mockMyUsername
}

describe('parseQuery', () => {
  const parseQuery = createQueryParser(store)

  it('can parse query without filter', async () => {
    const query = 'lorem       ipsum'
    const { normalizedQuery, queryObject } = await parseQuery(query)
    expect(normalizedQuery).toBe('lorem ipsum')
    expect(queryObject.word).toBe('lorem ipsum')
  })
  it('can parse query with date-filter', async () => {
    const query = 'lorem ipsum after:2021-01-23'
    const { normalizedQuery, queryObject } = await parseQuery(query)
    expect(normalizedQuery).toBe(query)
    expect(queryObject.word).toBe('lorem ipsum')
    expect(queryObject.after).toBe('2021-01-23T00:00:00.000Z')
  })
  it('can parse query with in-filter (prefix: `in:`, channel)', async () => {
    const query = `lorem ipsum in:${mockChannelName}`
    const { normalizedQuery, queryObject } = await parseQuery(query)
    expect(normalizedQuery).toBe(query)
    expect(queryObject.word).toBe('lorem ipsum')
    expect(queryObject.in).toEqual(mockChannelId)
  })
  it('can parse query with in-filter (prefix: `in:`, user)', async () => {
    const query = `lorem ipsum in:${mockUserName}`
    const { normalizedQuery, queryObject } = await parseQuery(query)
    expect(normalizedQuery).toBe(query)
    expect(queryObject.word).toBe('lorem ipsum')
    expect(queryObject.in).toEqual(mockDmChannelId)
  })
  it('can parse query with in-filter (prefix: `#`, channel)', async () => {
    const query = `lorem ipsum #${mockChannelName}`
    const { normalizedQuery, queryObject } = await parseQuery(query)
    expect(normalizedQuery).toBe(query)
    expect(queryObject.word).toBe('lorem ipsum')
    expect(queryObject.in).toEqual(mockChannelId)
  })
  it('can parse query with in-filter (prefix: `#`, user)', async () => {
    const query = `lorem ipsum #${mockUserName}`
    const { normalizedQuery, queryObject } = await parseQuery(query)
    expect(normalizedQuery).toBe(query)
    expect(queryObject.word).toBe(query)
    expect(queryObject.in).toBeUndefined()
  })
  it('can parse query with in-filter (prefix: `in:#`, channel)', async () => {
    const query = `lorem ipsum in:#${mockChannelName}`
    const { normalizedQuery, queryObject } = await parseQuery(query)
    expect(normalizedQuery).toBe(query)
    expect(queryObject.word).toBe('lorem ipsum')
    expect(queryObject.in).toEqual(mockChannelId)
  })
  it('can parse query with in-filter (prefix: `in:#`, user)', async () => {
    const query = `lorem ipsum in:#${mockUserName}`
    const { normalizedQuery, queryObject } = await parseQuery(query)
    expect(normalizedQuery).toBe(query)
    expect(queryObject.word).toBe(query)
    expect(queryObject.in).toBeUndefined()
  })
  it('can parse query with in-filter (prefix: `in:@`, channel)', async () => {
    const query = `lorem ipsum in:@${mockChannelName}`
    const { normalizedQuery, queryObject } = await parseQuery(query)
    expect(normalizedQuery).toBe(query)
    expect(queryObject.word).toBe(query)
    expect(queryObject.in).toBeUndefined()
  })
  it('can parse query with in-filter (prefix: `in:@`, user)', async () => {
    const query = `lorem ipsum in:@${mockUserName}`
    const { normalizedQuery, queryObject } = await parseQuery(query)
    expect(normalizedQuery).toBe(query)
    expect(queryObject.word).toBe('lorem ipsum')
    expect(queryObject.in).toEqual(mockDmChannelId)
  })
  it('can parse query with in:here', async () => {
    const query = 'lorem ipsum in:here'
    const { normalizedQuery, queryObject } = await parseQuery(query)
    expect(normalizedQuery).toBe(`lorem ipsum in:${mockCurrentChannelPath}`)
    expect(queryObject.word).toBe('lorem ipsum')
    expect(queryObject.in).toEqual(mockCurrentChannelId)
  })
  it('can parse query with in:me', async () => {
    const query = 'lorem ipsum in:me'
    const { normalizedQuery, queryObject } = await parseQuery(query)
    expect(normalizedQuery).toBe(`lorem ipsum in:@${mockMyUsername}`)
    expect(queryObject.word).toBe('lorem ipsum')
    expect(queryObject.in).toEqual(mockMyDmChannelId)
  })
  it('can parse query with user-filter (prefix: `from:`, user)', async () => {
    const query = `lorem ipsum from:${mockUserName}`
    const { normalizedQuery, queryObject } = await parseQuery(query)
    expect(normalizedQuery).toBe(query)
    expect(queryObject.word).toBe('lorem ipsum')
    expect(queryObject.from).toEqual(mockUserId)
  })
  it('can parse query with user-filter (prefix: `from:`, group)', () =>
    Promise.all(
      mockUserGroupIds.map(async (id, idx) => {
        const query = `lorem ipsum from:${mockUserGroupNames[idx]}`
        const { normalizedQuery, queryObject } = await parseQuery(query)
        expect(normalizedQuery).toBe(query)
        expect(queryObject.word).toBe('lorem ipsum')
        expect(queryObject.from).toEqual(store.userGroupIdToUserIds(id))
      })
    ))
  it('can parse query with user-filter (prefix: `to:`, user)', async () => {
    const query = `lorem ipsum to:${mockUserName}`
    const { normalizedQuery, queryObject } = await parseQuery(query)
    expect(normalizedQuery).toBe(query)
    expect(queryObject.word).toBe('lorem ipsum')
    expect(queryObject.to).toEqual([mockUserId])
  })
  it('can parse query with user-filter (prefix: `to(groups):`, user)', async () => {
    const query = `lorem ipsum to(groups):${mockUserName}`
    const { normalizedQuery, queryObject } = await parseQuery(query)
    expect(normalizedQuery).toBe(query)
    expect(queryObject.word).toBe('lorem ipsum')
    expect(queryObject.to).toEqual([
      ...(store.userIdToUserGroupIds(mockUserId) ?? []),
      mockUserId
    ])
  })
  it('can parse query with user-filter (prefix: `to:`, group)', () =>
    Promise.all(
      mockUserGroupIds.map(async (id, idx) => {
        const query = `lorem ipsum to:${mockUserGroupNames[idx]}`
        const { normalizedQuery, queryObject } = await parseQuery(query)
        expect(normalizedQuery).toBe(query)
        expect(queryObject.word).toBe('lorem ipsum')
        expect(queryObject.to).toEqual(id)
      })
    ))
  it('can parse query with user-filter (prefix: `to(groups):`, group)', () =>
    Promise.all(
      mockUserGroupIds.map(async (id, idx) => {
        const query = `lorem ipsum to(groups):${mockUserGroupNames[idx]}`
        const { normalizedQuery, queryObject } = await parseQuery(query)
        expect(normalizedQuery).toBe(query)
        expect(queryObject.word).toBe('lorem ipsum')
        expect(queryObject.to).toEqual(id)
      })
    ))
  it('can parse query with user-filter (prefix: `@`, user)', async () => {
    const query = `lorem ipsum @${mockUserName}`
    const { normalizedQuery, queryObject } = await parseQuery(query)
    expect(normalizedQuery).toBe(query)
    expect(queryObject.word).toBe('lorem ipsum')
    expect(queryObject.to).toEqual([mockUserId])
  })
  it('can parse query with user-filter (prefix: `@`, group)', () =>
    Promise.all(
      mockUserGroupIds.map(async (id, idx) => {
        const query = `lorem ipsum @${mockUserGroupNames[idx]}`
        const { normalizedQuery, queryObject } = await parseQuery(query)
        expect(normalizedQuery).toBe(query)
        expect(queryObject.word).toBe('lorem ipsum')
        expect(queryObject.to).toEqual(id)
      })
    ))
  it('can parse query with user-filter (prefix: `from:@`, user)', async () => {
    const query = `lorem ipsum from:@${mockUserName}`
    const { normalizedQuery, queryObject } = await parseQuery(query)
    expect(normalizedQuery).toBe(query)
    expect(queryObject.word).toBe('lorem ipsum')
    expect(queryObject.from).toEqual(mockUserId)
  })
  it('can parse query with user-filter (prefix: `from:@`, group)', async () =>
    Promise.all(
      mockUserGroupIds.map(async (id, idx) => {
        const query = `lorem ipsum from:@${mockUserGroupNames[idx]}`
        const { normalizedQuery, queryObject } = await parseQuery(query)
        expect(normalizedQuery).toBe(query)
        expect(queryObject.word).toBe('lorem ipsum')
        expect(queryObject.from).toEqual(store.userGroupIdToUserIds(id))
      })
    ))

  it('can parse query with user-filter (prefix: `@!`, user)', async () => {
    const query = `lorem ipsum @!${mockUserName}`
    const { normalizedQuery, queryObject } = await parseQuery(query)
    expect(normalizedQuery).toBe(query)
    expect(queryObject.word).toBe('lorem ipsum')
    expect(queryObject.to).toEqual([mockUserId])
  })
  it('can parse query with user-filter (prefix: `@!`, group)', () =>
    Promise.all(
      mockUserGroupIds.map(async (id, idx) => {
        const query = `lorem ipsum @!${mockUserGroupNames[idx]}`
        const { normalizedQuery, queryObject } = await parseQuery(query)
        expect(normalizedQuery).toBe(query)
        expect(queryObject.word).toBe(query)
        expect(queryObject.to).toBeUndefined()
      })
    ))
  it('can parse query with user-filter (prefix: `from:@!`, user)', async () => {
    const query = `lorem ipsum from:@!${mockUserName}`
    const { normalizedQuery, queryObject } = await parseQuery(query)
    expect(normalizedQuery).toBe(query)
    expect(queryObject.word).toBe('lorem ipsum')
    expect(queryObject.from).toEqual(mockUserId)
  })
  it('can parse query with user-filter (prefix: `from:@!`, group)', async () =>
    Promise.all(
      mockUserGroupIds.map(async (id, idx) => {
        const query = `lorem ipsum from:@!${mockUserGroupNames[idx]}`
        const { normalizedQuery, queryObject } = await parseQuery(query)
        expect(normalizedQuery).toBe(query)
        expect(queryObject.word).toBe(query)
        expect(queryObject.from).toBeUndefined()
      })
    ))

  it('can parse query with user-filter (prefix: `@&`, user)', async () => {
    const query = `lorem ipsum @&${mockUserName}`
    const { normalizedQuery, queryObject } = await parseQuery(query)
    expect(normalizedQuery).toBe(query)
    expect(queryObject.word).toBe(query)
    expect(queryObject.to).toBeUndefined()
  })
  it('can parse query with user-filter (prefix: `@&`, group)', () =>
    Promise.all(
      mockUserGroupIds.map(async (id, idx) => {
        const query = `lorem ipsum @&${mockUserGroupNames[idx]}`
        const { normalizedQuery, queryObject } = await parseQuery(query)
        expect(normalizedQuery).toBe(query)
        expect(queryObject.word).toBe('lorem ipsum')
        expect(queryObject.to).toEqual(id)
      })
    ))
  it('can parse query with user-filter (prefix: `from:@&`, user)', async () => {
    const query = `lorem ipsum from:@&${mockUserName}`
    const { normalizedQuery, queryObject } = await parseQuery(query)
    expect(normalizedQuery).toBe(query)
    expect(queryObject.word).toBe(query)
    expect(queryObject.from).toBeUndefined()
  })
  it('can parse query with user-filter (prefix: `from:@&`, group)', async () =>
    Promise.all(
      mockUserGroupIds.map(async (id, idx) => {
        const query = `lorem ipsum from:@&${mockUserGroupNames[idx]}`
        const { normalizedQuery, queryObject } = await parseQuery(query)
        expect(normalizedQuery).toBe(query)
        expect(queryObject.word).toBe('lorem ipsum')
        expect(queryObject.from).toEqual(store.userGroupIdToUserIds(id))
      })
    ))
  it('can parse query with me', async () => {
    const query = 'lorem ipsum to:me'
    const { normalizedQuery, queryObject } = await parseQuery(query)
    expect(normalizedQuery).toBe(`lorem ipsum to:@!${mockMyUsername}`)
    expect(queryObject.word).toBe('lorem ipsum')
    expect(queryObject.to).toEqual(mockMyUserId)
  })
  it('can parse query with an invalid prefix', async () => {
    const query = 'invalid:'
    const { normalizedQuery, queryObject } = await parseQuery(query)
    expect(normalizedQuery).toBe(query)
    expect(queryObject.word).toBe('invalid:')
  })
  it('can parse query with empty prefixes (1)', async () => {
    const query = 'after: in: cite: from:'
    const { normalizedQuery, queryObject } = await parseQuery(query)
    expect(normalizedQuery).toBe(query)
    expect(queryObject.after).toBeUndefined()
    expect(queryObject.in).toBeUndefined()
    expect(queryObject.from).toBeUndefined()
  })
  it('can parse query with empty prefixes (2)', async () => {
    const query = '# @'
    const { normalizedQuery, queryObject } = await parseQuery(query)
    expect(normalizedQuery).toBe(query)
    expect(queryObject.in).toBeUndefined()
    expect(queryObject.from).toBeUndefined()
  })
  it('can parse query with message-filter (url)', async () => {
    const query = `lorem ipsum cite:${mockMessageUrl}`
    const { normalizedQuery, queryObject } = await parseQuery(query)
    expect(normalizedQuery).toBe(query)
    expect(queryObject.word).toBe('lorem ipsum')
    expect(queryObject.citation).toEqual(mockMessageId)
  })
  it('can parse query with message-filter (not a message url)', async () => {
    const query = 'lorem ipsum cite:https://example.com/a'
    const { normalizedQuery, queryObject } = await parseQuery(query)
    expect(normalizedQuery).toBe(query)
    expect(queryObject.word).toBe('lorem ipsum cite:https://example.com/a')
    expect(queryObject.citation).toBeUndefined()
  })
  it('can parse query with message-filter (id)', async () => {
    const query = `lorem ipsum cite:${mockMessageId}`
    const { normalizedQuery, queryObject } = await parseQuery(query)
    expect(normalizedQuery).toBe(query)
    expect(queryObject.word).toBe('lorem ipsum')
    expect(queryObject.citation).toEqual(mockMessageId)
  })
  it('can parse query with media-flag-filter', async () => {
    const query = 'lorem has:image ipsum'
    const { normalizedQuery, queryObject } = await parseQuery(query)
    expect(normalizedQuery).toBe(query)
    expect(queryObject.word).toBe('lorem ipsum')
    expect(queryObject.hasImage).toBe(true)
  })
  it('can parse query with invalid media-flag-filter', async () => {
    const query = 'lorem has:ipsum'
    const { normalizedQuery, queryObject } = await parseQuery(query)
    expect(normalizedQuery).toBe(query)
    expect(queryObject.word).toBe('lorem has:ipsum')
    expect(queryObject.hasImage).toBeUndefined()
  })
  it('can parse query with invalid attr-flag-filter', async () => {
    const query = 'lorem ipsum is:bott'
    const { normalizedQuery, queryObject } = await parseQuery(query)
    expect(normalizedQuery).toBe(query)
    expect(queryObject.word).toBe('lorem ipsum is:bott')
    expect(queryObject.bot).toBeUndefined()
  })
  it('can parse query with negated flag-filter (not-style)', async () => {
    const query = 'lorem ipsum not:bot'
    const { normalizedQuery, queryObject } = await parseQuery(query)
    expect(normalizedQuery).toBe(query)
    expect(queryObject.word).toBe('lorem ipsum')
    expect(queryObject.bot).toBe(false)
  })
  it('can parse query with negated flag-filter (negation-style)', async () => {
    const query = 'lorem ipsum -is:bot'
    const { normalizedQuery, queryObject } = await parseQuery(query)
    expect(normalizedQuery).toBe(query)
    expect(queryObject.word).toBe('lorem ipsum')
    expect(queryObject.bot).toBe(false)
  })
  it('can parse query with wrong valued-filter', async () => {
    // @phantomさんは存在しないのでこのクエリはwordに入る
    const query = 'lorem ipsum from:@phantom'
    const { normalizedQuery, queryObject } = await parseQuery(query)
    expect(normalizedQuery).toBe(query)
    expect(queryObject.word).toBe(query)
    expect(queryObject.from).toBeUndefined()
  })
})

describe('toSearchMessageParam', () => {
  it('can convert query object to api param array', () => {
    const query = {
      word: 'lorem ipsum',
      after: '2021-01-23T00:00:00.000Z',
      before: '2021-01-23T00:00:00.000Z',
      in: mockChannelId,
      to: [mockUserId],
      from: [mockUserId],
      citation: undefined,
      bot: false,
      hasUrl: true,
      hasAttachments: true,
      hasImage: false
    }
    const options = {
      limit: 20,
      sort: 'createdAt' as const
    }
    const params = toSearchMessageParam(query, options)
    expect(params).toEqual([
      'lorem ipsum',
      '2021-01-23T00:00:00.000Z',
      '2021-01-23T00:00:00.000Z',
      mockChannelId,
      [mockUserId],
      [mockUserId],
      undefined,
      false,
      true,
      true,
      false,
      undefined,
      undefined,
      20,
      undefined,
      'createdAt'
    ])
  })
})
