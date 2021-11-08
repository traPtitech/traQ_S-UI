import { StoreForParser } from '/@/lib/searchMessage/parserBase'
import {
  createQueryParser,
  toSearchMessageParam
} from '/@/lib/searchMessage/queryParser'

const mockMessageId = 'message-id'
const mockMessageUrl = `https://example.com/messages/${mockMessageId}`
const mockChannelId = 'channel-id'
const mockChannelName = 'general'
const mockUserId = 'user-id'
const mockUserName = 'user'
const mockCurrentChannelId = 'current-channel-id'

describe('parseQuery', () => {
  const store: StoreForParser = {
    channelPathToId: channelPath => {
      if (channelPath === mockChannelName) {
        return mockChannelId
      }
      return undefined
    },
    usernameToId: username => {
      if (username === mockUserName) {
        return mockUserId
      }
      return undefined
    },
    getCurrentChannelId: () => mockCurrentChannelId
  }
  const parseQuery = createQueryParser(store)

  it('can parse query without filter', async () => {
    const query = 'lorem       ipsum'
    const parsed = await parseQuery(query)
    expect(parsed.word).toBe('lorem ipsum')
  })
  it('can parse query with date-filter', async () => {
    const query = 'lorem ipsum after:2021-01-23'
    const parsed = await parseQuery(query)
    expect(parsed.word).toEqual(`lorem ipsum`)
    expect(parsed.after).toBe('2021-01-23T00:00:00.000Z')
  })
  it('can parse query with in-filter (prefix: `in:`)', async () => {
    const query = `lorem ipsum in:${mockChannelName}`
    const parsed = await parseQuery(query)
    expect(parsed.word).toEqual(`lorem ipsum`)
    expect(parsed.in).toEqual(mockChannelId)
  })
  it('can parse query with in-filter (prefix: `#`)', async () => {
    const query = `lorem ipsum #${mockChannelName}`
    const parsed = await parseQuery(query)
    expect(parsed.word).toEqual(`lorem ipsum`)
    expect(parsed.in).toEqual(mockChannelId)
  })
  it('can parse query with in-filter (prefix: `in:#`)', async () => {
    const query = `lorem ipsum in:#${mockChannelName}`
    const parsed = await parseQuery(query)
    expect(parsed.word).toEqual(`lorem ipsum`)
    expect(parsed.in).toEqual(mockChannelId)
  })
  it('can parse query with in:here', async () => {
    const query = `lorem ipsum in:here`
    const parsed = await parseQuery(query)
    expect(parsed.word).toEqual(`lorem ipsum`)
    expect(parsed.in).toEqual(mockCurrentChannelId)
  })
  it('can parse query with user-filter without @', async () => {
    const query = `lorem ipsum from:${mockUserName}`
    const parsed = await parseQuery(query)
    expect(parsed.word).toEqual(`lorem ipsum`)
    expect(parsed.from).toEqual(mockUserId)
  })
  it('can parse query with user-filter with @', async () => {
    const query = `lorem ipsum from:@${mockUserName}`
    const parsed = await parseQuery(query)
    expect(parsed.word).toEqual(`lorem ipsum`)
    expect(parsed.from).toEqual(mockUserId)
  })
  it('can parse query with an invalid prefix', async () => {
    const query = 'invalid:'
    const parsed = await parseQuery(query)
    expect(parsed.word).toBe('invalid:')
  })
  it('can parse query with empty prefixes (1)', async () => {
    const query = 'after: in: cite: from:'
    const parsed = await parseQuery(query)
    expect(parsed.after).toBeUndefined()
    expect(parsed.in).toBeUndefined()
    expect(parsed.from).toBeUndefined()
  })
  it('can parse query with empty prefixes (2)', async () => {
    const query = '# @'
    const parsed = await parseQuery(query)
    expect(parsed.in).toBeUndefined()
    expect(parsed.from).toBeUndefined()
  })
  it('can parse query with message-filter (url)', async () => {
    const query = `lorem ipsum cite:${mockMessageUrl}`
    const parsed = await parseQuery(query)
    expect(parsed.word).toEqual(`lorem ipsum`)
    expect(parsed.citation).toEqual(mockMessageId)
  })
  it('can parse query with message-filter (not a message url)', async () => {
    const query = 'lorem ipsum cite:https://example.com/a'
    const parsed = await parseQuery(query)
    expect(parsed.word).toEqual(`lorem ipsum cite:https://example.com/a`)
    expect(parsed.citation).toBeUndefined()
  })
  it('can parse query with message-filter (id)', async () => {
    const query = `lorem ipsum cite:${mockMessageId}`
    const parsed = await parseQuery(query)
    expect(parsed.word).toEqual(`lorem ipsum`)
    expect(parsed.citation).toEqual(mockMessageId)
  })
  it('can parse query with media-flag-filter', async () => {
    const query = 'lorem has:image ipsum'
    const parsed = await parseQuery(query)
    expect(parsed.word).toBe('lorem ipsum')
    expect(parsed.hasImage).toBe(true)
  })
  it('can parse query with invalid media-flag-filter', async () => {
    const query = 'lorem has:ipsum'
    const parsed = await parseQuery(query)
    expect(parsed.word).toBe('lorem has:ipsum')
    expect(parsed.hasImage).toBeUndefined()
  })
  it('can parse query with invalid attr-flag-filter', async () => {
    const query = 'lorem ipsum is:bott'
    const parsed = await parseQuery(query)
    expect(parsed.word).toBe('lorem ipsum is:bott')
    expect(parsed.bot).toBeUndefined()
  })
  it('can parse query with negated flag-filter (not-style)', async () => {
    const query = 'lorem ipsum not:bot'
    const parsed = await parseQuery(query)
    expect(parsed.word).toEqual(`lorem ipsum`)
    expect(parsed.bot).toBe(false)
  })
  it('can parse query with negated flag-filter (negation-style)', async () => {
    const query = 'lorem ipsum -is:bot'
    const parsed = await parseQuery(query)
    expect(parsed.word).toEqual(`lorem ipsum`)
    expect(parsed.bot).toBe(false)
  })
  it('can parse query with wrong valued-filter', async () => {
    // @phantomさんは存在しないのでこのクエリはwordに入る
    const query = 'lorem ipsum from:@phantom'
    const parsed = await parseQuery(query)
    expect(parsed.word).toEqual(`lorem ipsum from:@phantom`)
    expect(parsed.from).toBeUndefined()
  })
})

describe('toSearchMessageParam', () => {
  it('can convert query object to api param array', () => {
    const query = {
      word: 'lorem ipsum',
      after: '2021-01-23T00:00:00.000Z',
      before: '2021-01-23T00:00:00.000Z',
      in: mockChannelId,
      to: mockUserId,
      from: mockUserId,
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
      mockUserId,
      mockUserId,
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
