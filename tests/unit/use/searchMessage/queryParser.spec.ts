import useQueryParer from '@/use/searchMessage/queryParser'
import store from '@/store'

const mockMessageId = 'message-id'
const mockMessageUrl = `https://example.com/messages/${mockMessageId}`
const mockChannelId = 'channel-id'
const mockChannelName = 'general'
const mockUserId = 'user-id'
const mockUserName = 'user'

const { parseQuery, toSearchMessageParam } = useQueryParer()

beforeAll(async () => {
  store.commit.entities.setUser({
    id: mockUserId,
    name: mockUserName,
    displayName: 'poyo',
    iconFileId: '',
    bot: false,
    state: 1,
    updatedAt: '2021-01-23T00:00:00.000Z'
  })
  store.commit.entities.setChannel({
    id: mockChannelId,
    parentId: null,
    archived: false,
    force: false,
    topic: '',
    name: mockChannelName,
    children: []
  })
  await store.dispatch.domain.channelTree.constructAllTrees()
})

describe('parseQuery', () => {
  it('can parse query without filter', async () => {
    const query = 'lorem       ipsum'
    const parsed = await parseQuery(query)
    expect(parsed.word).toEqual('lorem ipsum')
  })
  it('can parse query with date-filter', async () => {
    const query = 'lorem ipsum after:2021-01-23'
    const parsed = await parseQuery(query)
    expect(parsed.word).toEqual(`lorem ipsum`)
    expect(parsed.after).toEqual('2021-01-23T00:00:00.000Z')
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
  it('can parse query with empty prefixes (1)', async () => {
    const query = 'after: in: cite:' // TODO: `from:`を追加する
    const parsed = await parseQuery(query)
    expect(parsed.after).toEqual(undefined)
    expect(parsed.in).toEqual(undefined)
    expect(parsed.from).toEqual(undefined)
  })
  it('can parse query with empty prefixes (2)', async () => {
    const query = '#' // TODO: `@`を追加する
    const parsed = await parseQuery(query)
    expect(parsed.in).toEqual(undefined)
    expect(parsed.from).toEqual(undefined)
  })
  it('can parse query with message-filter (url)', async () => {
    const query = `lorem ipsum cite:${mockMessageUrl}`
    const parsed = await parseQuery(query)
    expect(parsed.word).toEqual(`lorem ipsum`)
    expect(parsed.citation).toEqual(mockMessageId)
  })
  it('can parse query with message-filter (id)', async () => {
    const query = `lorem ipsum cite:${mockMessageId}`
    const parsed = await parseQuery(query)
    expect(parsed.word).toEqual(`lorem ipsum`)
    expect(parsed.citation).toEqual(mockMessageId)
  })
  it('can parse query with flag-filter', async () => {
    const query = 'lorem has:image ipsum'
    const parsed = await parseQuery(query)
    expect(parsed.word).toEqual(`lorem ipsum`)
    expect(parsed.hasImage).toEqual(true)
  })
  it('can parse query with negated flag-filter (not-style)', async () => {
    const query = 'lorem ipsum not:bot'
    const parsed = await parseQuery(query)
    expect(parsed.word).toEqual(`lorem ipsum`)
    expect(parsed.bot).toEqual(false)
  })
  it('can parse query with negated flag-filter (negation-style)', async () => {
    const query = 'lorem ipsum -is:bot'
    const parsed = await parseQuery(query)
    expect(parsed.word).toEqual(`lorem ipsum`)
    expect(parsed.bot).toEqual(false)
  })
  // FIXME: API呼び出しをモックしないとこのテストは実行できない
  /*
  it('can parse query with wrong valued-filter', async () => {
    // @phantomさんは存在しないのでこのクエリはwordに入る
    const query = 'lorem ipsum from:@phantom'
    const parsed = await parseQuery(query)
    expect(parsed.word).toEqual(`lorem ipsum from:@phantom`)
    expect(parsed.from).toEqual(undefined)
  })
  */
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
