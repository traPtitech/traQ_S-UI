import {
  encodeReference,
  parseInput,
  partsToDisplayText
} from '/@/lib/references'
import type { StoreForParser } from '/@/lib/searchMessage/parserBase'
import { createQueryParser } from '/@/lib/searchMessage/queryParser'

const createStore = (): StoreForParser => ({
  channelPathToId: () => 'channel-before-rename',
  userNameToDmChannelId: () => 'dm-id',
  userNameToId: () => 'user-before-rename',
  userGroupNameToId: () => undefined,
  getCurrentChannelPathOrUserName: () => '#first',
  getCurrentChannelId: () => 'first-channel',
  getMyDmChannelId: () => 'my-dm',
  getMyUserName: () => 'me',
  getMyUserId: () => 'my-id'
})

describe('persisted search references', () => {
  it('preserves the selected entity kind when persisting an executed query', async () => {
    const reference = {
      type: 'search-from',
      id: 'group-id',
      raw: 'from:@team',
      kind: 'group'
    } as const

    const result = await createQueryParser(createStore())(
      encodeReference(reference)
    )

    expect(parseInput(result.serializedQuery, 'search')).toMatchObject([
      { type: 'reference', reference }
    ])
  })

  it('uses selected IDs even when names disappear or are reused', async () => {
    const store = createStore()
    const resolve = vi.fn(() => 'someone-else')
    store.userNameToId = resolve

    const query = encodeReference({
      type: 'search-from',
      id: 'chosen-id',
      raw: 'from:@alice'
    })

    const result = await createQueryParser(store)(query)

    expect(result.queryObject.from).toEqual(['chosen-id'])
    expect(resolve).not.toHaveBeenCalled()
  })

  it('freezes relative filters when executed, including DM and group IDs', async () => {
    const store = createStore()
    const parse = createQueryParser(store)
    const first = await parse('hello in:here from:me to:me')
    store.getCurrentChannelId = () => 'other-channel'
    store.getMyUserId = () => 'other-user'
    const second = await parse(first.serializedQuery)

    expect(second.queryObject).toEqual(first.queryObject)
    expect(second.queryObject.in).toBe('first-channel')
    expect(second.queryObject.from).toEqual(['my-id'])
    expect(second.queryObject.to).toEqual(['my-id'])
    expect((await parse('in:me')).queryObject.in).toBe('my-dm')
  })

  it('preserves search syntax and duplicate-filter precedence', async () => {
    const parse = createQueryParser(createStore())

    const first = await parse(
      'topic from:alice from:bob after:2020-01-01 has:image not:bot'
    )

    const second = await parse(first.serializedQuery)

    expect(second.queryObject).toEqual(first.queryObject)
    expect(second.queryObject.word).toBe('topic')
    expect(second.queryObject.hasImage).toBe(true)
    expect(second.queryObject.bot).toBe(false)
  })

  it('accepts old text history and resolves it only on execution', async () => {
    const result = await createQueryParser(createStore())('from:alice')

    expect(
      partsToDisplayText(parseInput(result.serializedQuery, 'search'))
    ).toBe('from:alice')

    expect(parseInput(result.serializedQuery, 'search')).toMatchObject([
      { type: 'reference', reference: { id: 'user-before-rename' } }
    ])
  })

  it('rejects unresolved relative constraints instead of widening the search', async () => {
    const store = createStore()
    store.getCurrentChannelId = () => undefined
    await expect(createQueryParser(store)('in:here')).rejects.toThrow()
  })

  it('captures the relative context before an asynchronous name lookup', async () => {
    const store = createStore()

    store.userNameToId = async () => {
      store.getCurrentChannelId = () => 'changed-during-lookup'

      return 'user-id'
    }

    const result = await createQueryParser(store)('in:here from:alice')

    expect(result.queryObject.in).toBe('first-channel')
  })
})
