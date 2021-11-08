import { ChannelId } from '/@/types/entity-ids'
import {
  MatchResult,
  channelDeepMatching,
  canCreateChildChannel,
  channelIdToSimpleChannelPath,
  channelIdToPathString
} from '/@/lib/channel'
import { ChannelLike } from '/@/lib/channelTree'

/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "expectResultToBeSame"] }] */

describe('canCreateChildChannel', () => {
  it('can create', () => {
    expect(canCreateChildChannel('a/b/c', false)).toBe(true)
  })
  it('cannot create (omit isArchived parameter)', () => {
    expect(canCreateChildChannel('a/b/c')).toBe(true)
  })
  it('cannot create (nested more than 5)', () => {
    expect(canCreateChildChannel('a/b/c/d/e', false)).toBe(false)
  })
  it('cannot create (archived)', () => {
    expect(canCreateChildChannel('a/b/c', true)).toBe(false)
  })
})

describe('channelIdToSimpleChannelPath', () => {
  it('should return empty array if unknown channel id was passed', () => {
    expect(channelIdToSimpleChannelPath(unknownChannelId, channelMap)).toEqual(
      []
    )
  })
  it('should return', () => {
    const actual = channelIdToSimpleChannelPath(
      '0dd14681-c0ad-1ba2-2ff3-a4ad90f773d1',
      channelMap
    )
    const expected = [
      { id: 'e45a34fe-2d2b-1f41-83fd-3d345fdd9df0', name: 'general' },
      { id: '0dd14681-c0ad-1ba2-2ff3-a4ad90f773d1', name: 'exective' }
    ]
    expect(actual).toEqual(expected)
  })
})

describe('channelIdToPathString', () => {
  it('should return empty string if unknown channel id was passed', () => {
    expect(channelIdToPathString(unknownChannelId, channelMap)).toBe('')
  })
  it('should return', () => {
    const actual = channelIdToPathString(
      '0dd14681-c0ad-1ba2-2ff3-a4ad90f773d1',
      channelMap
    )
    const expected = 'general/exective'
    expect(actual).toEqual(expected)
  })
})

describe('channelDeepMatching', () => {
  it('one empty query', () => {
    expectResultToBeSame(channelDeepMatching(channelMap, ['']), {
      perfectMatched: [],
      matched: [
        'e45a34fe-2d2b-1f41-83fd-3d345fdd9df0',
        '0dd14681-c0ad-1ba2-2ff3-a4ad90f773d1',
        'c9d4d957-141d-5ca2-0557-04589ca9187a',
        '231da375-5246-731a-8e59-0d08c3c1f138',
        '522cfa75-5729-92ab-78d9-4dd0ef98ecec',
        '77524bb3-0aed-4f7e-153b-c3706945be11',
        '27a2ec88-d2d2-8b16-4e48-87577be2cdd3',
        '7ae96689-7720-14a3-33d9-476ba1e7194f',
        '3648304b-a229-415c-b2c9-1cf72b7a2188',
        '43f92228-719a-901d-00df-40c32a042fd9',
        '680a82fc-3a97-62bc-c977-8ac14f9049d3',
        '2570dac4-21b0-282f-f2ef-f8462ea17d8b',
        'd80eeee8-9ec8-1063-f47b-2c54813725b1',
        'b5a49916-f1e6-b452-546c-3f4ef8843bc5',
        'ce93eaec-203e-e7fa-b112-609b4a7f7e0f',
        '12d1455f-ec59-36f0-7609-799cfa5fc68f',
        'fb1cecc8-8cbc-33c3-d895-c724fcbf7039',
        '38a5e796-f380-38fd-a1c8-92949a38caad',
        '066f3f2b-5775-4963-aed5-78307e4e8122',
        '346973d0-895e-80bd-c3aa-86f482dd69ce'
      ]
    })
  })
  it('one query matching', () => {
    expectResultToBeSame(channelDeepMatching(channelMap, ['gen']), {
      perfectMatched: [],
      matched: [
        'e45a34fe-2d2b-1f41-83fd-3d345fdd9df0',
        '680a82fc-3a97-62bc-c977-8ac14f9049d3',
        '38a5e796-f380-38fd-a1c8-92949a38caad'
      ]
    })
  })
  it('one query matching with full match', () => {
    expectResultToBeSame(channelDeepMatching(channelMap, ['gene']), {
      perfectMatched: [
        '680a82fc-3a97-62bc-c977-8ac14f9049d3',
        '38a5e796-f380-38fd-a1c8-92949a38caad'
      ],
      matched: ['e45a34fe-2d2b-1f41-83fd-3d345fdd9df0']
    })
  })
  it('two empty query', () => {
    expectResultToBeSame(channelDeepMatching(channelMap, ['', '']), {
      perfectMatched: [],
      matched: [
        '0dd14681-c0ad-1ba2-2ff3-a4ad90f773d1',
        'c9d4d957-141d-5ca2-0557-04589ca9187a',
        '231da375-5246-731a-8e59-0d08c3c1f138',
        '522cfa75-5729-92ab-78d9-4dd0ef98ecec',
        '77524bb3-0aed-4f7e-153b-c3706945be11',
        '27a2ec88-d2d2-8b16-4e48-87577be2cdd3',
        '7ae96689-7720-14a3-33d9-476ba1e7194f',
        '3648304b-a229-415c-b2c9-1cf72b7a2188',
        '680a82fc-3a97-62bc-c977-8ac14f9049d3',
        '2570dac4-21b0-282f-f2ef-f8462ea17d8b',
        'd80eeee8-9ec8-1063-f47b-2c54813725b1',
        'b5a49916-f1e6-b452-546c-3f4ef8843bc5',
        'ce93eaec-203e-e7fa-b112-609b4a7f7e0f',
        'fb1cecc8-8cbc-33c3-d895-c724fcbf7039',
        '38a5e796-f380-38fd-a1c8-92949a38caad',
        '066f3f2b-5775-4963-aed5-78307e4e8122',
        '346973d0-895e-80bd-c3aa-86f482dd69ce'
      ]
    })
  })
  it('two query with parent only', () => {
    expectResultToBeSame(channelDeepMatching(channelMap, ['geN', '']), {
      perfectMatched: [],
      matched: [
        '0dd14681-c0ad-1ba2-2ff3-a4ad90f773d1',
        '27a2ec88-d2d2-8b16-4e48-87577be2cdd3',
        '2570dac4-21b0-282f-f2ef-f8462ea17d8b',
        '066f3f2b-5775-4963-aed5-78307e4e8122'
      ]
    })
  })
  it('two query with child only', () => {
    expectResultToBeSame(channelDeepMatching(channelMap, ['', 'gen']), {
      perfectMatched: [],
      matched: [
        '680a82fc-3a97-62bc-c977-8ac14f9049d3',
        '38a5e796-f380-38fd-a1c8-92949a38caad'
      ]
    })
  })
  it('two query with parent & child', () => {
    expectResultToBeSame(channelDeepMatching(channelMap, ['gen', 'a']), {
      perfectMatched: [],
      matched: ['27a2ec88-d2d2-8b16-4e48-87577be2cdd3']
    })
  })
  it('none match two query', () => {
    expectResultToBeSame(channelDeepMatching(channelMap, ['zzz', 'z']), {
      perfectMatched: [],
      matched: []
    })
  })
  it('three empty query', () => {
    expectResultToBeSame(channelDeepMatching(channelMap, ['', '', '']), {
      perfectMatched: [],
      matched: [
        'c9d4d957-141d-5ca2-0557-04589ca9187a',
        '231da375-5246-731a-8e59-0d08c3c1f138',
        '522cfa75-5729-92ab-78d9-4dd0ef98ecec',
        '77524bb3-0aed-4f7e-153b-c3706945be11',
        '7ae96689-7720-14a3-33d9-476ba1e7194f',
        '3648304b-a229-415c-b2c9-1cf72b7a2188',
        '2570dac4-21b0-282f-f2ef-f8462ea17d8b',
        'b5a49916-f1e6-b452-546c-3f4ef8843bc5',
        'ce93eaec-203e-e7fa-b112-609b4a7f7e0f',
        '38a5e796-f380-38fd-a1c8-92949a38caad',
        '066f3f2b-5775-4963-aed5-78307e4e8122',
        '346973d0-895e-80bd-c3aa-86f482dd69ce'
      ]
    })
  })
  it('four query', () => {
    expectResultToBeSame(
      channelDeepMatching(channelMap, ['gen', 'C', 'd', 'r']),
      {
        perfectMatched: [],
        matched: ['231da375-5246-731a-8e59-0d08c3c1f138']
      }
    )
  })

  it('one empty query on star channels', () => {
    expectResultToBeSame(channelDeepMatching(channelMap, [''], starChannels), {
      perfectMatched: [],
      matched: [
        '77524bb3-0aed-4f7e-153b-c3706945be11',
        '7ae96689-7720-14a3-33d9-476ba1e7194f',
        '2570dac4-21b0-282f-f2ef-f8462ea17d8b',
        '38a5e796-f380-38fd-a1c8-92949a38caad'
      ]
    })
  })
  it('one query on star channels', () => {
    expectResultToBeSame(
      channelDeepMatching(channelMap, ['gE'], starChannels),
      {
        perfectMatched: [],
        matched: [
          '7ae96689-7720-14a3-33d9-476ba1e7194f',
          '38a5e796-f380-38fd-a1c8-92949a38caad'
        ]
      }
    )
  })
  it('two query on star channels', () => {
    expectResultToBeSame(
      channelDeepMatching(channelMap, ['ge', ''], starChannels),
      {
        perfectMatched: [],
        matched: ['2570dac4-21b0-282f-f2ef-f8462ea17d8b']
      }
    )
  })
  it('three query on star channels', () => {
    expectResultToBeSame(
      channelDeepMatching(channelMap, ['b', 'a', 'ge'], starChannels),
      {
        perfectMatched: [],
        matched: ['38a5e796-f380-38fd-a1c8-92949a38caad']
      }
    )
  })
})

const sortResult = <T extends ChannelLike>(
  result: MatchResult<T>
): MatchResult<T> => ({
  perfectMatched: result.perfectMatched.sort((a: T, b: T) =>
    a.id < b.id ? 1 : -1
  ),
  matched: result.matched.sort((a: T, b: T) => (a.id < b.id ? 1 : -1))
})
const isNotUndefined = <T>(x: T): x is Exclude<T, undefined> => x !== undefined

interface MatchResultIds {
  perfectMatched: string[]
  matched: string[]
}

const expectResultToBeSame = (
  expected: MatchResult<ChannelLike>,
  result: MatchResultIds
) =>
  expect(sortResult(expected)).toEqual(
    sortResult({
      perfectMatched: result.perfectMatched
        .map(id => channelMap.get(id))
        .filter(isNotUndefined),
      matched: result.matched
        .map(id => channelMap.get(id))
        .filter(isNotUndefined)
    })
  )

const unknownChannelId = '11111111-1111-1111-1111-111111111111'

/*
general (e45a34fe-2d2b-1f41-83fd-3d345fdd9df0)
  / exective (0dd14681-c0ad-1ba2-2ff3-a4ad90f773d1)
    / unders (c9d4d957-141d-5ca2-0557-04589ca9187a)
      / relations (231da375-5246-731a-8e59-0d08c3c1f138)
        / hoge (522cfa75-5729-92ab-78d9-4dd0ef98ecec)
        / fuga ★ (77524bb3-0aed-4f7e-153b-c3706945be11)
  / A (27a2ec88-d2d2-8b16-4e48-87577be2cdd3)
    / hoge ★ (7ae96689-7720-14a3-33d9-476ba1e7194f)
      / fuga (3648304b-a229-415c-b2c9-1cf72b7a2188)
a (43f92228-719a-901d-00df-40c32a042fd9)
  / Gene (680a82fc-3a97-62bc-c977-8ac14f9049d3)
    / b ★ (2570dac4-21b0-282f-f2ef-f8462ea17d8b)
  / hoge (d80eeee8-9ec8-1063-f47b-2c54813725b1)
    / b (b5a49916-f1e6-b452-546c-3f4ef8843bc5)
      / fuga (ce93eaec-203e-e7fa-b112-609b4a7f7e0f)
b (12d1455f-ec59-36f0-7609-799cfa5fc68f)
  / a (fb1cecc8-8cbc-33c3-d895-c724fcbf7039)
    / gene ★ (38a5e796-f380-38fd-a1c8-92949a38caad)
      / hoge (066f3f2b-5775-4963-aed5-78307e4e8122)
        / fuga (346973d0-895e-80bd-c3aa-86f482dd69ce)
*/
const starChannels = new Set<string>([
  '77524bb3-0aed-4f7e-153b-c3706945be11',
  '7ae96689-7720-14a3-33d9-476ba1e7194f',
  '2570dac4-21b0-282f-f2ef-f8462ea17d8b',
  '38a5e796-f380-38fd-a1c8-92949a38caad'
])

const channelMap = new Map<ChannelId, ChannelLike>([
  [
    'e45a34fe-2d2b-1f41-83fd-3d345fdd9df0',
    {
      id: 'e45a34fe-2d2b-1f41-83fd-3d345fdd9df0',
      name: 'general',
      parentId: null,
      children: [
        '0dd14681-c0ad-1ba2-2ff3-a4ad90f773d1',
        '27a2ec88-d2d2-8b16-4e48-87577be2cdd3'
      ],
      archived: false
    }
  ],
  [
    '0dd14681-c0ad-1ba2-2ff3-a4ad90f773d1',
    {
      id: '0dd14681-c0ad-1ba2-2ff3-a4ad90f773d1',
      name: 'exective',
      parentId: 'e45a34fe-2d2b-1f41-83fd-3d345fdd9df0',
      children: ['c9d4d957-141d-5ca2-0557-04589ca9187a'],
      archived: false
    }
  ],
  [
    'c9d4d957-141d-5ca2-0557-04589ca9187a',
    {
      id: 'c9d4d957-141d-5ca2-0557-04589ca9187a',
      name: 'unders',
      parentId: '0dd14681-c0ad-1ba2-2ff3-a4ad90f773d1',
      children: ['231da375-5246-731a-8e59-0d08c3c1f138'],
      archived: false
    }
  ],
  [
    '231da375-5246-731a-8e59-0d08c3c1f138',
    {
      id: '231da375-5246-731a-8e59-0d08c3c1f138',
      name: 'relations',
      parentId: 'c9d4d957-141d-5ca2-0557-04589ca9187a',
      children: [
        '522cfa75-5729-92ab-78d9-4dd0ef98ecec',
        '77524bb3-0aed-4f7e-153b-c3706945be11'
      ],
      archived: false
    }
  ],
  [
    '522cfa75-5729-92ab-78d9-4dd0ef98ecec',
    {
      id: '522cfa75-5729-92ab-78d9-4dd0ef98ecec',
      name: 'hoge',
      parentId: '231da375-5246-731a-8e59-0d08c3c1f138',
      children: [],
      archived: false
    }
  ],
  [
    '77524bb3-0aed-4f7e-153b-c3706945be11',
    {
      id: '77524bb3-0aed-4f7e-153b-c3706945be11',
      name: 'fuga',
      parentId: '231da375-5246-731a-8e59-0d08c3c1f138',
      children: [],
      archived: false
    }
  ],
  [
    '27a2ec88-d2d2-8b16-4e48-87577be2cdd3',
    {
      id: '27a2ec88-d2d2-8b16-4e48-87577be2cdd3',
      name: 'A',
      parentId: 'e45a34fe-2d2b-1f41-83fd-3d345fdd9df0',
      children: ['7ae96689-7720-14a3-33d9-476ba1e7194f'],
      archived: false
    }
  ],
  [
    '7ae96689-7720-14a3-33d9-476ba1e7194f',
    {
      id: '7ae96689-7720-14a3-33d9-476ba1e7194f',
      name: 'hoge',
      parentId: '27a2ec88-d2d2-8b16-4e48-87577be2cdd3',
      children: ['3648304b-a229-415c-b2c9-1cf72b7a2188'],
      archived: false
    }
  ],
  [
    '3648304b-a229-415c-b2c9-1cf72b7a2188',
    {
      id: '3648304b-a229-415c-b2c9-1cf72b7a2188',
      name: 'fuga',
      parentId: '7ae96689-7720-14a3-33d9-476ba1e7194f',
      children: [],
      archived: false
    }
  ],
  [
    '43f92228-719a-901d-00df-40c32a042fd9',
    {
      id: '43f92228-719a-901d-00df-40c32a042fd9',
      name: 'a',
      parentId: null,
      children: [
        '680a82fc-3a97-62bc-c977-8ac14f9049d3',
        'd80eeee8-9ec8-1063-f47b-2c54813725b1'
      ],
      archived: false
    }
  ],
  [
    '680a82fc-3a97-62bc-c977-8ac14f9049d3',
    {
      id: '680a82fc-3a97-62bc-c977-8ac14f9049d3',
      name: 'Gene',
      parentId: '43f92228-719a-901d-00df-40c32a042fd9',
      children: ['2570dac4-21b0-282f-f2ef-f8462ea17d8b'],
      archived: false
    }
  ],
  [
    '2570dac4-21b0-282f-f2ef-f8462ea17d8b',
    {
      id: '2570dac4-21b0-282f-f2ef-f8462ea17d8b',
      name: 'b',
      parentId: '680a82fc-3a97-62bc-c977-8ac14f9049d3',
      children: [],
      archived: false
    }
  ],
  [
    'd80eeee8-9ec8-1063-f47b-2c54813725b1',
    {
      id: 'd80eeee8-9ec8-1063-f47b-2c54813725b1',
      name: 'hoge',
      parentId: '43f92228-719a-901d-00df-40c32a042fd9',
      children: ['b5a49916-f1e6-b452-546c-3f4ef8843bc5'],
      archived: false
    }
  ],
  [
    'b5a49916-f1e6-b452-546c-3f4ef8843bc5',
    {
      id: 'b5a49916-f1e6-b452-546c-3f4ef8843bc5',
      name: 'b',
      parentId: 'd80eeee8-9ec8-1063-f47b-2c54813725b1',
      children: ['ce93eaec-203e-e7fa-b112-609b4a7f7e0f'],
      archived: false
    }
  ],
  [
    'ce93eaec-203e-e7fa-b112-609b4a7f7e0f',
    {
      id: 'ce93eaec-203e-e7fa-b112-609b4a7f7e0f',
      name: 'fuga',
      parentId: 'b5a49916-f1e6-b452-546c-3f4ef8843bc5',
      children: [],
      archived: false
    }
  ],
  [
    '12d1455f-ec59-36f0-7609-799cfa5fc68f',
    {
      id: '12d1455f-ec59-36f0-7609-799cfa5fc68f',
      name: 'b',
      parentId: null,
      children: ['fb1cecc8-8cbc-33c3-d895-c724fcbf7039'],
      archived: false
    }
  ],
  [
    'fb1cecc8-8cbc-33c3-d895-c724fcbf7039',
    {
      id: 'fb1cecc8-8cbc-33c3-d895-c724fcbf7039',
      name: 'a',
      parentId: '12d1455f-ec59-36f0-7609-799cfa5fc68f',
      children: ['38a5e796-f380-38fd-a1c8-92949a38caad'],
      archived: false
    }
  ],
  [
    '38a5e796-f380-38fd-a1c8-92949a38caad',
    {
      id: '38a5e796-f380-38fd-a1c8-92949a38caad',
      name: 'gene',
      parentId: 'fb1cecc8-8cbc-33c3-d895-c724fcbf7039',
      children: ['066f3f2b-5775-4963-aed5-78307e4e8122'],
      archived: false
    }
  ],
  [
    '066f3f2b-5775-4963-aed5-78307e4e8122',
    {
      id: '066f3f2b-5775-4963-aed5-78307e4e8122',
      name: 'hoge',
      parentId: '38a5e796-f380-38fd-a1c8-92949a38caad',
      children: ['346973d0-895e-80bd-c3aa-86f482dd69ce'],
      archived: false
    }
  ],
  [
    '346973d0-895e-80bd-c3aa-86f482dd69ce',
    {
      id: '346973d0-895e-80bd-c3aa-86f482dd69ce',
      name: 'fuga',
      parentId: '066f3f2b-5775-4963-aed5-78307e4e8122',
      children: [],
      archived: false
    }
  ]
])
