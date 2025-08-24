import { createTestingPinia } from '@pinia/testing'
import { useChannelsStore } from '/@/store/entities/channels'
import type { Channel } from '@traptitech/traq'
import useChannel from '/@/composables/useChannelPath'

describe('useChannelPath', () => {
  beforeEach(() => {
    createTestingPinia()

    const { channelsMap } = useChannelsStore()
    const refinedChannels: Channel[] = channels.map(channel => ({
      ...channel,
      force: false,
      topic: '',
      children: channels
        .filter(child => child.parentId === channel.id)
        .map(c => c.id)
    }))
    channelsMap.value = new Map(refinedChannels.map(c => [c.id, c]))
  })

  test('channel tree', () => {
    const topChannels = channels.filter(c => c.parentId === null)
    type DumpedChannel = { name: string; children: DumpedChannel[] }
    const dump = (channel: (typeof channels)[number]): DumpedChannel => ({
      name: channel.name,
      children: channels.filter(c => c.parentId === channel.id).map(dump)
    })

    const result = topChannels.map(dump)
    expect(result).toEqual([
      { name: 'event', children: [] },
      {
        name: 'gps',
        children: [
          {
            name: 'times',
            children: [
              {
                name: 'traPer1',
                children: [
                  { name: 'sub', children: [] },
                  { name: 'lec_jikkyo', children: [] },
                  { name: 'user1_ignore', children: [] },
                  { name: 'ChildLongNameIsNotCut', children: [] }
                ]
              },
              {
                name: 'user1',
                children: [
                  { name: 'sub', children: [] },
                  { name: 'bot', children: [] },
                  { name: 'user1_ignore', children: [] }
                ]
              },
              {
                name: 'LongNametraPer',
                children: [
                  { name: 'LongNametraPer_sup', children: [] },
                  { name: 'test', children: [] }
                ]
              },
              {
                name: 'LongNametraPer2',
                children: [
                  { name: 'LongNametraPer_sup', children: [] },
                  { name: 'test', children: [] }
                ]
              },
              {
                name: 'ParentLongNameMayBeCut',
                children: [{ name: 'sub', children: [] }]
              }
            ]
          },
          {
            name: 'tips',
            children: [
              {
                name: 'user1',
                children: [
                  { name: 'sub', children: [] },
                  { name: 'bot', children: [] }
                ]
              }
            ]
          }
        ]
      },
      {
        name: 'team',
        children: [
          {
            name: 'SysAd_takenohito',
            children: [
              { name: 'random', children: [{ name: 'test', children: [] }] },
              { name: 'randos', children: [{ name: 'test', children: [] }] }
            ]
          },
          {
            name: 'SysAd_cp20',
            children: [
              { name: 'random', children: [{ name: 'test', children: [] }] },
              { name: 'randos', children: [{ name: 'test', children: [] }] }
            ]
          }
        ]
      },
      {
        name: 'event',
        children: [
          {
            name: 'hackathon',
            children: [
              {
                name: '24_spring',
                children: [
                  { name: '01', children: [{ name: 'program', children: [] }] },
                  { name: '02', children: [{ name: 'program', children: [] }] }
                ]
              },
              {
                name: '24_winter',
                children: [
                  { name: '01', children: [{ name: 'program', children: [] }] },
                  { name: '02', children: [{ name: 'program', children: [] }] }
                ]
              }
            ]
          }
        ]
      }
    ])
  })

  test.each([
    {
      id: '442154db-b6c2-4941-801f-60fe14bae4e2',
      expectedPath: ['gps', 'times', 'traPer1', 'sub'],
      expectedShort: 'g/t/traPer1/sub'
    },
    {
      id: '0d425611-823c-4177-933c-ec06c44ab347',
      expectedPath: ['gps', 'times', 'traPer1', 'lec_jikkyo'],
      expectedShort: 'g/t/t/lec_jikkyo'
    },
    {
      id: 'a76c14d0-259c-4d3c-aceb-9b82b3d82bce',
      expectedPath: ['gps', 'times', 'traPer1', 'ChildLongNameIsNotCut'],
      expectedShort: 'g/t/t/ChildLongNameIsNotCut'
    },
    {
      id: 'cad1904f-2f09-4330-aa22-69387e5e09c6',
      expectedPath: ['gps', 'times', 'ParentLongNameMayBeCut', 'sub'],
      expectedShort: 'g/t/P/sub'
    },
    {
      id: '3de8179a-3b0a-4ac3-9876-f70d5b9a2628',
      expectedPath: ['gps', 'times', 'user1', 'sub'],
      expectedShort: 'g/times/user1/sub'
    },
    {
      id: '6eebbc37-7025-4ced-be0d-581321e91c11',
      expectedPath: ['gps', 'times', 'LongNametraPer'],
      expectedShort: 'g/t/LongNametraPer'
    },
    {
      id: '7ebe3c61-20cc-4a5e-8836-603162b273d4',
      expectedPath: ['gps', 'times', 'LongNametraPer', 'LongNametraPer_sup'],
      expectedShort: 'g/t/L/LongNametraPer_sup'
    },
    {
      id: '774374b6-ad61-4b0c-844e-7338412c7d85',
      expectedPath: ['gps', 'times', 'LongNametraPer2', 'test'],
      expectedShort: 'g/t/LongNametraPer2/test'
    },
    {
      id: '1f83dc32-8db0-4237-8440-a0fb4fe52301',
      expectedPath: ['event', 'hackathon', '24_spring', '02', 'program'],
      expectedShort: 'e/h/24_s/02/program'
    },
    {
      id: '254b4e17-049c-4c0c-a27b-57d37d9eb573',
      expectedPath: ['gps', 'times', 'traPer1', 'user1_ignore'],
      expectedShort: 'g/t/t/user1_ignore'
    },
    {
      id: 'bb9cfb69-1adc-404b-ad94-5d59ee34dca1',
      expectedPath: ['gps', 'times', 'user1', 'user1_ignore'],
      expectedShort: 'g/t/u/user1_ignore'
    },
    {
      id: '09fd79f0-4635-48d9-aae4-b986a452f592',
      expectedPath: ['team', 'SysAd_cp20', 'random', 'test'],
      expectedShort: 't/S/random/test'
    }
  ])(
    'channelIdToShortPathString: $expectedPath -> $expectedShort',
    ({ id, expectedPath, expectedShort }) => {
      const { channelIdToShortPathString, channelIdToPath } = useChannel()

      expect(channelIdToPath(id)).toEqual(expectedPath)
      expect(channelIdToShortPathString(id)).toBe(expectedShort)
    }
  )
})

const channels: Omit<Channel, 'children' | 'topic' | 'force'>[] = [
  {
    id: 'e50e2c2b-d9d5-4fc6-a30b-908a0f65d425',
    name: 'event',
    archived: false,
    parentId: null
  },
  {
    id: 'a89ae3f4-64c5-49cc-acc9-aaafa4d5ee4c',
    name: 'gps',
    archived: false,
    parentId: null
  },
  {
    id: '220832c7-9e86-40e6-bf84-b3bb28eb7c3c',
    name: 'times',
    archived: false,
    parentId: 'a89ae3f4-64c5-49cc-acc9-aaafa4d5ee4c'
  },
  {
    id: '26f396b1-2233-4e2f-b217-a3fb511a4bf4',
    name: 'traPer1',
    archived: false,
    parentId: '220832c7-9e86-40e6-bf84-b3bb28eb7c3c'
  },
  {
    id: '442154db-b6c2-4941-801f-60fe14bae4e2',
    name: 'sub',
    archived: false,
    parentId: '26f396b1-2233-4e2f-b217-a3fb511a4bf4'
  },
  {
    id: '0d425611-823c-4177-933c-ec06c44ab347',
    name: 'lec_jikkyo',
    archived: false,
    parentId: '26f396b1-2233-4e2f-b217-a3fb511a4bf4'
  },
  {
    id: '254b4e17-049c-4c0c-a27b-57d37d9eb573',
    name: 'user1_ignore',
    archived: false,
    parentId: '26f396b1-2233-4e2f-b217-a3fb511a4bf4'
  },
  {
    id: 'a76c14d0-259c-4d3c-aceb-9b82b3d82bce',
    name: 'ChildLongNameIsNotCut',
    archived: false,
    parentId: '26f396b1-2233-4e2f-b217-a3fb511a4bf4'
  },
  {
    id: '2b287559-12a5-4a95-a420-ee08aad2208c',
    name: 'user1',
    archived: false,
    parentId: '220832c7-9e86-40e6-bf84-b3bb28eb7c3c'
  },
  {
    id: '3de8179a-3b0a-4ac3-9876-f70d5b9a2628',
    name: 'sub',
    archived: false,
    parentId: '2b287559-12a5-4a95-a420-ee08aad2208c'
  },
  {
    id: 'e915b068-dc6e-4997-b44b-3ec045d226ca',
    name: 'bot',
    archived: false,
    parentId: '2b287559-12a5-4a95-a420-ee08aad2208c'
  },
  {
    id: 'bb9cfb69-1adc-404b-ad94-5d59ee34dca1',
    name: 'user1_ignore',
    archived: true,
    parentId: '2b287559-12a5-4a95-a420-ee08aad2208c'
  },
  {
    id: '6eebbc37-7025-4ced-be0d-581321e91c11',
    name: 'LongNametraPer',
    archived: false,
    parentId: '220832c7-9e86-40e6-bf84-b3bb28eb7c3c'
  },
  {
    id: '7ebe3c61-20cc-4a5e-8836-603162b273d4',
    name: 'LongNametraPer_sup',
    archived: false,
    parentId: '6eebbc37-7025-4ced-be0d-581321e91c11'
  },
  {
    id: 'c0217492-3c4e-40b4-bd89-26f14e838150',
    name: 'test',
    archived: false,
    parentId: '6eebbc37-7025-4ced-be0d-581321e91c11'
  },
  {
    id: '5d9210f0-9809-474d-bfbb-287cd05a7fd5',
    name: 'LongNametraPer2',
    archived: false,
    parentId: '220832c7-9e86-40e6-bf84-b3bb28eb7c3c'
  },
  {
    id: '23c816cd-6239-411c-a2ef-a7dcd94430bd',
    name: 'LongNametraPer_sup',
    archived: false,
    parentId: '5d9210f0-9809-474d-bfbb-287cd05a7fd5'
  },
  {
    id: '774374b6-ad61-4b0c-844e-7338412c7d85',
    name: 'test',
    archived: false,
    parentId: '5d9210f0-9809-474d-bfbb-287cd05a7fd5'
  },
  {
    id: '6636d7bf-8b4f-464e-b1c6-a8ed462b61aa',
    name: 'ParentLongNameMayBeCut',
    archived: false,
    parentId: '220832c7-9e86-40e6-bf84-b3bb28eb7c3c'
  },
  {
    id: 'cad1904f-2f09-4330-aa22-69387e5e09c6',
    name: 'sub',
    archived: false,
    parentId: '6636d7bf-8b4f-464e-b1c6-a8ed462b61aa'
  },
  {
    id: 'f56e6d34-1f8b-4065-85b9-b85d8762daaf',
    name: 'tips',
    archived: false,
    parentId: 'a89ae3f4-64c5-49cc-acc9-aaafa4d5ee4c'
  },
  {
    id: '268e5380-fbd3-4d97-846f-d15cf7f101ce',
    name: 'user1',
    archived: false,
    parentId: 'f56e6d34-1f8b-4065-85b9-b85d8762daaf'
  },
  {
    id: '96721686-2267-4ac7-ab6b-cd2780ecfe2d',
    name: 'sub',
    archived: false,
    parentId: '268e5380-fbd3-4d97-846f-d15cf7f101ce'
  },
  {
    id: '4b8b5efd-7eed-454d-b59d-b76c52658048',
    name: 'bot',
    archived: false,
    parentId: '268e5380-fbd3-4d97-846f-d15cf7f101ce'
  },
  {
    id: '17da19ef-2744-4550-8468-b01517db2905',
    name: 'team',
    archived: false,
    parentId: null
  },
  {
    id: 'e4d49ad5-d617-492b-b15a-576f96a1d829',
    name: 'SysAd_takenohito',
    archived: false,
    parentId: '17da19ef-2744-4550-8468-b01517db2905'
  },
  {
    id: 'e5b022bd-56e6-4bfb-90a5-bd68addff1f0',
    name: 'random',
    archived: false,
    parentId: 'e4d49ad5-d617-492b-b15a-576f96a1d829'
  },
  {
    id: 'ef650f3b-e1e1-48b8-8bde-d08edd53aad3',
    name: 'test',
    archived: false,
    parentId: 'e5b022bd-56e6-4bfb-90a5-bd68addff1f0'
  },
  {
    id: 'eb018aba-08d1-460c-845a-59958550f2f6',
    name: 'randos',
    archived: false,
    parentId: 'e4d49ad5-d617-492b-b15a-576f96a1d829'
  },
  {
    id: 'a8403944-05e9-4621-9a4d-c73da8e35f6a',
    name: 'test',
    archived: false,
    parentId: 'eb018aba-08d1-460c-845a-59958550f2f6'
  },
  {
    id: '3400aba6-96c4-4994-ac8d-3e4fa8df941d',
    name: 'SysAd_cp20',
    archived: false,
    parentId: '17da19ef-2744-4550-8468-b01517db2905'
  },
  {
    id: '58a8c618-072a-4b4d-a79a-8a309b367535',
    name: 'random',
    archived: false,
    parentId: '3400aba6-96c4-4994-ac8d-3e4fa8df941d'
  },
  {
    id: '09fd79f0-4635-48d9-aae4-b986a452f592',
    name: 'test',
    archived: false,
    parentId: '58a8c618-072a-4b4d-a79a-8a309b367535'
  },
  {
    id: '06e40d93-7024-4cad-889c-9ff8a145110f',
    name: 'randos',
    archived: false,
    parentId: '3400aba6-96c4-4994-ac8d-3e4fa8df941d'
  },
  {
    id: '38fac331-ab8d-434f-9bae-2acc584da8a0',
    name: 'test',
    archived: false,
    parentId: '06e40d93-7024-4cad-889c-9ff8a145110f'
  },
  {
    id: '734b0017-e1d3-4ef1-9200-d45f197b1df5',
    name: 'event',
    archived: false,
    parentId: null
  },
  {
    id: '89a71d67-71de-4df5-bebd-abcc0c93614f',
    name: 'hackathon',
    archived: false,
    parentId: '734b0017-e1d3-4ef1-9200-d45f197b1df5'
  },
  {
    id: 'd84082bd-9712-48a7-8329-67a13bf403e2',
    name: '24_spring',
    archived: false,
    parentId: '89a71d67-71de-4df5-bebd-abcc0c93614f'
  },
  {
    id: '97b6b3ee-760c-45bb-8968-53e71c00e373',
    name: '01',
    archived: false,
    parentId: 'd84082bd-9712-48a7-8329-67a13bf403e2'
  },
  {
    id: 'cc0d6a67-1e6e-424e-be96-6e121698301e',
    name: 'program',
    archived: false,
    parentId: '97b6b3ee-760c-45bb-8968-53e71c00e373'
  },
  {
    id: '6b57c3fc-6e0b-4d17-bfaa-f071b365a64e',
    name: '02',
    archived: false,
    parentId: 'd84082bd-9712-48a7-8329-67a13bf403e2'
  },
  {
    id: '1f83dc32-8db0-4237-8440-a0fb4fe52301',
    name: 'program',
    archived: false,
    parentId: '6b57c3fc-6e0b-4d17-bfaa-f071b365a64e'
  },
  {
    id: 'aad91ac9-b68e-4672-81aa-e70d439d1457',
    name: '24_winter',
    archived: false,
    parentId: '89a71d67-71de-4df5-bebd-abcc0c93614f'
  },
  {
    id: '20d544e4-64af-4849-a631-78b965c60b9c',
    name: '01',
    archived: false,
    parentId: 'aad91ac9-b68e-4672-81aa-e70d439d1457'
  },
  {
    id: 'ebd67d81-a9e6-4510-8a72-5cdccb0f1116',
    name: 'program',
    archived: false,
    parentId: '20d544e4-64af-4849-a631-78b965c60b9c'
  },
  {
    id: 'f9c17526-2e47-444f-86cf-e0a68e994247',
    name: '02',
    archived: false,
    parentId: 'aad91ac9-b68e-4672-81aa-e70d439d1457'
  },
  {
    id: '314c5bb6-9646-43bd-9461-c0bfdbbbcfb5',
    name: 'program',
    archived: false,
    parentId: 'f9c17526-2e47-444f-86cf-e0a68e994247'
  }
]
