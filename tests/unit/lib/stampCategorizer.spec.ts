import {
  constructStampNameIdMap,
  categorizeUnicodeStamps,
  traQStampsToStampCategory
} from '/@/lib/stampCategorizer'
import { Stamp } from '@traptitech/traq'
import { StampId } from '/@/types/entity-ids'

describe('constructStampNameIdMap', () => {
  it('can construct', () => {
    expect(constructStampNameIdMap(stampEntities)).toEqual(stampNameIdMap)
  })
})

describe('categorizeUnicodeStamps', () => {
  it('can categorize', async () => {
    expect(await categorizeUnicodeStamps(unicodeStampNameIdMap)).toEqual(
      unicodeCategories
    )
  })
})

describe('traQStampsToStampCategory', () => {
  it('can transform to category', async () => {
    expect(traQStampsToStampCategory(traQStampNameIdMap)).toEqual(traQCategory)
  })
})

const stampEntities: Map<StampId, Stamp> = new Map([
  [
    'd7461966-e5d3-4c6d-9538-7c8605f45a1e',
    {
      id: 'd7461966-e5d3-4c6d-9538-7c8605f45a1e',
      name: 'e',
      creatorId: 'e97518db-ebb8-450f-9b4a-273234e68491',
      createdAt: '2020-05-05T12:47:46.461369Z',
      fileId: 'e97518db-ebb8-450f-9b4a-273234e68491',
      isUnicode: false,
      updatedAt: '2020-05-05T12:47:46.461369Z'
    }
  ],
  [
    'd7461966-e5d3-4c6d-9538-7c8605f45a1d',
    {
      id: 'd7461966-e5d3-4c6d-9538-7c8605f45a1d',
      name: 'd',
      creatorId: 'e97518db-ebb8-450f-9b4a-273234e68491',
      createdAt: '2020-05-05T12:47:46.461369Z',
      fileId: 'e97518db-ebb8-450f-9b4a-273234e68491',
      isUnicode: false,
      updatedAt: '2020-05-05T12:47:46.461369Z'
    }
  ],
  [
    '84956b64-3575-40ca-b55f-54b0364fbca3',
    {
      id: '84956b64-3575-40ca-b55f-54b0364fbca3',
      name: 'smile',
      creatorId: '00000000-0000-0000-0000-000000000000',
      fileId: '280d52f2-3532-4f53-894a-54798d24d28b',
      isUnicode: true,
      createdAt: '2019-02-28T12:20:27Z',
      updatedAt: '2020-04-26T06:54:47.54376Z'
    }
  ],
  [
    '1265290a-3f16-4066-a6c5-43703d0db269',
    {
      id: '1265290a-3f16-4066-a6c5-43703d0db269',
      name: 'regional_indicator_e',
      creatorId: '00000000-0000-0000-0000-000000000000',
      fileId: '6db4600b-c35b-4479-b642-4fa6165af180',
      isUnicode: true,
      createdAt: '2019-02-28T12:20:26Z',
      updatedAt: '2020-04-26T06:54:34.848249Z'
    }
  ]
])

const stampNameIdMap = {
  unicodeStampMap: new Map([
    ['smile', '84956b64-3575-40ca-b55f-54b0364fbca3'],
    ['regional_indicator_e', '1265290a-3f16-4066-a6c5-43703d0db269']
  ]),
  traQStampMap: new Map([
    ['e', 'd7461966-e5d3-4c6d-9538-7c8605f45a1e'],
    ['d', 'd7461966-e5d3-4c6d-9538-7c8605f45a1d']
  ])
}

const unicodeStampNameIdMap = new Map([
  ['smile', '84956b64-3575-40ca-b55f-54b0364fbca3'],
  ['regional_indicator_e', '1265290a-3f16-4066-a6c5-43703d0db269']
])

const unicodeCategories = [
  { name: 'people', stampIds: ['84956b64-3575-40ca-b55f-54b0364fbca3'] },
  { name: 'nature', stampIds: [] },
  { name: 'food', stampIds: [] },
  { name: 'activity', stampIds: [] },
  { name: 'travel', stampIds: [] },
  { name: 'objects', stampIds: [] },
  { name: 'symbols', stampIds: [] },
  { name: 'flags', stampIds: [] },
  { name: 'regional', stampIds: ['1265290a-3f16-4066-a6c5-43703d0db269'] }
]

const traQStampNameIdMap = new Map([
  ['e', 'd7461966-e5d3-4c6d-9538-7c8605f45a1e'],
  ['d', 'd7461966-e5d3-4c6d-9538-7c8605f45a1d']
])

const traQCategory = {
  name: 'traq',
  stampIds: [
    'd7461966-e5d3-4c6d-9538-7c8605f45a1d',
    'd7461966-e5d3-4c6d-9538-7c8605f45a1e'
  ]
}
