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
const mockCurrentChannelPath = 'current/channel'
const mockCurrentChannelId = 'current-channel-id'
const mockCurrentUsername = 'currentUser'
const mockCurrentUserDmChannelId = 'current-user-dm-channel-id'
const mockMyUserId = 'my-user-id'
const mockMyDmChannelId = 'my-dm-channel-id'
const mockMyUsername = 'myUsername'

describe('parseQuery', () => {
  const TEST_CASES = [
    {
      description: 'plain',
      query: 'lorem       ipsum',
      expectedNormalizedQuery: 'lorem ipsum',
      expectedQueryObject: { word: 'lorem ipsum' }
    },
    {
      description: 'with date-filter',
      query: 'lorem ipsum after:2021-01-23',
      expectedNormalizedQuery: 'lorem ipsum after:2021-01-23',
      expectedQueryObject: {
        word: 'lorem ipsum',
        after: '2021-01-23T00:00:00.000Z'
      }
    },
    {
      description: 'with in-filter (prefix: `in:`, channel)',
      query: `lorem ipsum in:${mockChannelName}`,
      expectedNormalizedQuery: `lorem ipsum in:${mockChannelName}`,
      expectedQueryObject: { word: 'lorem ipsum', in: mockChannelId }
    },
    {
      description: 'with in-filter (prefix: `in:`, user)',
      query: `lorem ipsum in:${mockUserName}`,
      expectedNormalizedQuery: `lorem ipsum in:${mockUserName}`,
      expectedQueryObject: { word: 'lorem ipsum', in: mockDmChannelId }
    },
    {
      description: 'with in-filter (prefix: `#`, channel)',
      query: `lorem ipsum #${mockChannelName}`,
      expectedNormalizedQuery: `lorem ipsum #${mockChannelName}`,
      expectedQueryObject: { word: 'lorem ipsum', in: mockChannelId }
    },
    {
      description: 'with in-filter (prefix: `#`, user)',
      query: `lorem ipsum #${mockUserName}`,
      expectedNormalizedQuery: `lorem ipsum #${mockUserName}`,
      expectedQueryObject: {
        word: `lorem ipsum #${mockUserName}`,
        in: undefined
      }
    },
    {
      description: 'with in-filter (prefix: `in:#`, channel)',
      query: `lorem ipsum in:#${mockChannelName}`,
      expectedNormalizedQuery: `lorem ipsum in:#${mockChannelName}`,
      expectedQueryObject: { word: 'lorem ipsum', in: mockChannelId }
    },
    {
      description: 'with in-filter (prefix: `in:#`, user)',
      query: `lorem ipsum in:#${mockUserName}`,
      expectedNormalizedQuery: `lorem ipsum in:#${mockUserName}`,
      expectedQueryObject: {
        word: `lorem ipsum in:#${mockUserName}`,
        in: undefined
      }
    },
    {
      description: 'with in-filter (prefix: `in:@`, channel)',
      query: `lorem ipsum in:@${mockChannelName}`,
      expectedNormalizedQuery: `lorem ipsum in:@${mockChannelName}`,
      expectedQueryObject: {
        word: `lorem ipsum in:@${mockChannelName}`,
        in: undefined
      }
    },
    {
      description: 'with in-filter (prefix: `in:@`, user)',
      query: `lorem ipsum in:@${mockUserName}`,
      expectedNormalizedQuery: `lorem ipsum in:@${mockUserName}`,
      expectedQueryObject: { word: 'lorem ipsum', in: mockDmChannelId }
    },
    {
      description: 'with in:here',
      query: 'lorem ipsum in:here',
      expectedNormalizedQuery: `lorem ipsum in:${mockCurrentChannelPath}`,
      expectedQueryObject: { word: 'lorem ipsum', in: mockCurrentChannelId }
    },
    {
      description: 'with in:me',
      query: 'lorem ipsum in:me',
      expectedNormalizedQuery: `lorem ipsum in:${mockMyUsername}`,
      expectedQueryObject: { word: 'lorem ipsum', in: mockMyDmChannelId }
    },
    {
      description: 'with user-filter without @',
      query: `lorem ipsum from:${mockUserName}`,
      expectedNormalizedQuery: `lorem ipsum from:${mockUserName}`,
      expectedQueryObject: { word: 'lorem ipsum', from: mockUserId }
    },
    {
      description: 'with user-filter with @',
      query: `lorem ipsum from:@${mockUserName}`,
      expectedNormalizedQuery: `lorem ipsum from:@${mockUserName}`,
      expectedQueryObject: { word: 'lorem ipsum', from: mockUserId }
    },
    {
      description: 'with me',
      query: 'lorem ipsum to:me',
      expectedNormalizedQuery: `lorem ipsum to:${mockMyUsername}`,
      expectedQueryObject: { word: 'lorem ipsum', to: mockMyUserId }
    },
    {
      description: 'with an invalid prefix',
      query: 'invalid:',
      expectedNormalizedQuery: 'invalid:',
      expectedQueryObject: { word: 'invalid:' }
    },
    {
      description: 'with empty prefixes (1)',
      query: 'after: in: cite: from:',
      expectedNormalizedQuery: 'after: in: cite: from:',
      expectedQueryObject: {
        after: undefined,
        in: undefined,
        from: undefined
      }
    },
    {
      description: 'with empty prefixes (2)',
      query: '# @',
      expectedNormalizedQuery: '# @',
      expectedQueryObject: { in: undefined, from: undefined }
    },
    {
      description: 'with message-filter (url)',
      query: `lorem ipsum cite:${mockMessageUrl}`,
      expectedNormalizedQuery: `lorem ipsum cite:${mockMessageUrl}`,
      expectedQueryObject: { word: 'lorem ipsum', citation: mockMessageId }
    },
    {
      description: 'with message-filter (not a message url)',
      query: 'lorem ipsum cite:https://example.com/a',
      expectedNormalizedQuery: 'lorem ipsum cite:https://example.com/a',
      expectedQueryObject: {
        word: 'lorem ipsum cite:https://example.com/a',
        citation: undefined
      }
    },
    {
      description: 'with message-filter (id)',
      query: `lorem ipsum cite:${mockMessageId}`,
      expectedNormalizedQuery: `lorem ipsum cite:${mockMessageId}`,
      expectedQueryObject: { word: 'lorem ipsum', citation: mockMessageId }
    },
    {
      description: 'with media-flag-filter',
      query: 'lorem has:image ipsum',
      expectedNormalizedQuery: 'lorem has:image ipsum',
      expectedQueryObject: { word: 'lorem ipsum', hasImage: true }
    },
    {
      description: 'with invalid media-flag-filter',
      query: 'lorem has:ipsum',
      expectedNormalizedQuery: 'lorem has:ipsum',
      expectedQueryObject: { word: 'lorem has:ipsum', hasImage: undefined }
    },
    {
      description: 'with invalid attr-flag-filter',
      query: 'lorem ipsum is:bott',
      expectedNormalizedQuery: 'lorem ipsum is:bott',
      expectedQueryObject: { word: 'lorem ipsum is:bott', bot: undefined }
    },
    {
      description: 'with negated flag-filter (not-style)',
      query: 'lorem ipsum not:bot',
      expectedNormalizedQuery: 'lorem ipsum not:bot',
      expectedQueryObject: { word: 'lorem ipsum', bot: false }
    },
    {
      description: 'with negated flag-filter (negation-style)',
      query: 'lorem ipsum -is:bot',
      expectedNormalizedQuery: 'lorem ipsum -is:bot',
      expectedQueryObject: { word: 'lorem ipsum', bot: false }
    },
    {
      description: 'with wrong valued-filter',
      query: 'lorem ipsum from:@phantom',
      expectedNormalizedQuery: 'lorem ipsum from:@phantom',
      expectedQueryObject: {
        word: 'lorem ipsum from:@phantom',
        from: undefined
      }
    }
  ]

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
    getCurrentChannelId: () => mockCurrentChannelId,
    getMyDmChannelId: () => mockMyDmChannelId,
    getMyUserId: () => mockMyUserId,
    getCurrentChannelPathOrUsername: () => mockCurrentChannelPath,
    getMyUsername: () => mockMyUsername
  }
  const parseQuery = createQueryParser(store)

  test.each(TEST_CASES)(
    '$description',
    async ({ query, expectedNormalizedQuery, expectedQueryObject }) => {
      const { normalizedQuery, queryObject } = await parseQuery(query)

      expect(normalizedQuery).toBe(expectedNormalizedQuery)

      Object.entries(expectedQueryObject).forEach(([key, value]) => {
        expect(queryObject[key as keyof typeof queryObject]).toEqual(value)
      })
    }
  )
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
