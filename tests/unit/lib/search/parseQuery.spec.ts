import { parseQueryToObject } from '@/lib/search/parseQuery'
import store from '@/store'

const mockChannelId = 'channel-id'
const mockChannelName = 'general'
const mockUserId = 'user-id'
const mockUserName = 'user'

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

describe('parseQueryToObject', () => {
  it('can parse query without filter', () => {
    const query = 'lorem       ipsum'
    const parsed = parseQueryToObject(query)
    expect(parsed.word).toEqual('lorem ipsum')
  })
  it('can parse query with date-filter', () => {
    const query = 'lorem ipsum after:2021-01-23'
    const parsed = parseQueryToObject(query)
    expect(parsed.word).toEqual(`lorem ipsum`)
    expect(parsed.after).toEqual('2021-01-23T00:00:00.000Z')
  })
  it('can parse query with in-filter (prefix: `in:`)', () => {
    const query = `lorem ipsum in:${mockChannelName}`
    const parsed = parseQueryToObject(query)
    expect(parsed.word).toEqual(`lorem ipsum`)
    expect(parsed.in).toEqual(mockChannelId)
  })
  it('can parse query with in-filter (prefix: `#`)', () => {
    const query = `lorem ipsum #${mockChannelName}`
    const parsed = parseQueryToObject(query)
    expect(parsed.word).toEqual(`lorem ipsum`)
    expect(parsed.in).toEqual(mockChannelId)
  })
  it('can parse query with user-filter without @', () => {
    const query = `lorem ipsum from:${mockUserName}`
    const parsed = parseQueryToObject(query)
    expect(parsed.word).toEqual(`lorem ipsum`)
    expect(parsed.from).toEqual(mockUserId)
  })
  it('can parse query with user-filter with @', () => {
    const query = `lorem ipsum from:@${mockUserName}`
    const parsed = parseQueryToObject(query)
    expect(parsed.word).toEqual(`lorem ipsum`)
    expect(parsed.from).toEqual(mockUserId)
  })
  it('can parse query with flag-filter', () => {
    const query = 'lorem has:image ipsum'
    const parsed = parseQueryToObject(query)
    expect(parsed.word).toEqual(`lorem ipsum`)
    expect(parsed.hasImage).toEqual(true)
  })
  it('can parse query with negated flag-filter (not-style)', () => {
    const query = 'lorem ipsum not:bot'
    const parsed = parseQueryToObject(query)
    expect(parsed.word).toEqual(`lorem ipsum`)
    expect(parsed.bot).toEqual(false)
  })
  it('can parse query with negated flag-filter (negation-style)', () => {
    const query = 'lorem ipsum -is:bot'
    const parsed = parseQueryToObject(query)
    expect(parsed.word).toEqual(`lorem ipsum`)
    expect(parsed.bot).toEqual(false)
  })
  it('can parse query with wrong valued-filter', () => {
    // @phantomさんは存在しないのでこのクエリはwordに入る
    const query = 'lorem ipsum from:@phantom'
    const parsed = parseQueryToObject(query)
    expect(parsed.word).toEqual(`lorem ipsum from:@phantom`)
    expect(parsed.from).toEqual(undefined)
  })
})
