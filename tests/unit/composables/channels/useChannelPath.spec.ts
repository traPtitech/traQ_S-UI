import { createTestingPinia } from '@pinia/testing'
import { useChannelsStore } from '/@/store/entities/channels'
import type { Channel } from '@traptitech/traq'
import { useChannelTree } from '/@/store/domain/channelTree'
import useChannel from '/@/composables/useChannelPath'


describe('useChannelPath', () => {
  beforeEach(() => {
    createTestingPinia()
    const {channelsMap} = useChannelsStore()
    channelsMap.value = new Map(channels.map((c) => [c.id, c]))
    for (const c of channelsMap.value){
        if (c[1].parentId !== null){
            channelsMap.value.get(c[1].parentId)?.children.push(c[0])
        }
    }

    
    // 初期化処理 (Arrange)
    // チャンネルの一覧を初期化
  })



  it("Shortfy chnnels path",() => {
  const {channelIdToShortPathString, channelIdToPath} = useChannel()
    
    expect(channelIdToPath('442154db-b6c2-4941-801f-60fe14bae4e2')).toEqual(['gps', 'times', 'Naru_18', 'sub'])
    expect(channelIdToShortPathString('442154db-b6c2-4941-801f-60fe14bae4e2')).toBe("g/t/Naru_18/sub")

    expect(channelIdToPath('0d425611-823c-4177-933c-ec06c44ab347')).toEqual(['gps', 'times', 'Naru_18', 'lec_jikkyo'])
    expect(channelIdToShortPathString('0d425611-823c-4177-933c-ec06c44ab347')).toBe("g/t/N/lec_jikkyo")

    expect(channelIdToPath('a76c14d0-259c-4d3c-aceb-9b82b3d82bce')).toEqual(['gps', 'times', 'Naru_18', 'ChildLongNameIsNotCut'])
    expect(channelIdToShortPathString('a76c14d0-259c-4d3c-aceb-9b82b3d82bce')).toBe("g/t/N/ChildLongNameIsNotCut")

    expect(channelIdToPath('cad1904f-2f09-4330-aa22-69387e5e09c6')).toEqual(['gps', 'times', 'ParentLongNameMayBeCut', 'sub'])
    expect(channelIdToShortPathString('cad1904f-2f09-4330-aa22-69387e5e09c6')).toBe("g/t/P/sub")

    expect(channelIdToPath('3de8179a-3b0a-4ac3-9876-f70d5b9a2628')).toEqual(['gps', 'times', 'yasao', 'sub'])
    expect(channelIdToShortPathString('3de8179a-3b0a-4ac3-9876-f70d5b9a2628')).toBe("g/times/yasao/sub")


    expect(channelIdToPath('6eebbc37-7025-4ced-be0d-581321e91c11')).toEqual(['gps', 'times', 'unsignedintger'])
    expect(channelIdToShortPathString('6eebbc37-7025-4ced-be0d-581321e91c11')).toBe("g/t/unsignedintger")


    expect(channelIdToPath('7ebe3c61-20cc-4a5e-8836-603162b273d4')).toEqual(['gps', 'times', 'unsignedintger', 'unsignedintger_sup'])
    expect(channelIdToShortPathString('7ebe3c61-20cc-4a5e-8836-603162b273d4')).toBe("g/t/u/unsignedintger_sup")


    expect(channelIdToPath('774374b6-ad61-4b0c-844e-7338412c7d85')).toEqual(['gps', 'times', 'unsignedintger2', 'test'])
    expect(channelIdToShortPathString('774374b6-ad61-4b0c-844e-7338412c7d85')).toBe("g/t/unsignedintger2/test")


    expect(channelIdToPath('1f83dc32-8db0-4237-8440-a0fb4fe52301')).toEqual(['event', 'hackathon', '24_spring', '02', "program"])
    expect(channelIdToShortPathString("1f83dc32-8db0-4237-8440-a0fb4fe52301")).toBe("e/h/24_s/02/program")

      // -----------------------------|---------|----------|---------|---------|------------------------
      // File                         | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s      
      // -----------------------------|---------|----------|---------|---------|------------------------
      // useChannelPath.ts            |   77.34 |    67.24 |   66.66 |   77.34 | ...165,174-178,182-187 
  })
})


const channels: Channel[] = [
  {
    id: 'e50e2c2b-d9d5-4fc6-a30b-908a0f65d425',
    name: 'event',
    archived: false,
    children: [],
    force: false,
    parentId: null,
    topic: '',
  },
  {
    id: 'a89ae3f4-64c5-49cc-acc9-aaafa4d5ee4c',
    name: 'gps',
    archived: false,
    children: [],
    force: false,
    parentId: null,
    topic: '',
  },
    {
        id: '220832c7-9e86-40e6-bf84-b3bb28eb7c3c',
        name: 'times',
        archived: false,
        children: [],
        force: false,
        parentId: 'a89ae3f4-64c5-49cc-acc9-aaafa4d5ee4c',
        topic: '',
    },
        {
            id: '26f396b1-2233-4e2f-b217-a3fb511a4bf4',
            name: 'Naru_18',
            archived: false,
            children: [],
            force: false,
            parentId: '220832c7-9e86-40e6-bf84-b3bb28eb7c3c',
            topic: '',
        },
            {
                id: '442154db-b6c2-4941-801f-60fe14bae4e2',
                name: 'sub',
                archived: false,
                children: [],
                force: false,
                parentId: '26f396b1-2233-4e2f-b217-a3fb511a4bf4',
                topic: '',
            },
            {
                id: '0d425611-823c-4177-933c-ec06c44ab347',
                name: 'lec_jikkyo',
                archived: false,
                children: [],
                force: false,
                parentId: '26f396b1-2233-4e2f-b217-a3fb511a4bf4',
                topic: '',
            },
            {
                id: 'a76c14d0-259c-4d3c-aceb-9b82b3d82bce',
                name: 'ChildLongNameIsNotCut',
                archived: false,
                children: [],
                force: false,
                parentId: '26f396b1-2233-4e2f-b217-a3fb511a4bf4',
                topic: '',
            },
        {
            id: '2b287559-12a5-4a95-a420-ee08aad2208c',
            name: 'yasao',
            archived: false,
            children: [],
            force: false,
            parentId: '220832c7-9e86-40e6-bf84-b3bb28eb7c3c',
            topic: '',
        },
            {
                id: '3de8179a-3b0a-4ac3-9876-f70d5b9a2628',
                name: 'sub',
                archived: false,
                children: [],
                force: false,
                parentId: '2b287559-12a5-4a95-a420-ee08aad2208c',
                topic: '',
            },
            {
                id: 'e915b068-dc6e-4997-b44b-3ec045d226ca',
                name: 'bot',
                archived: false,
                children: [],
                force: false,
                parentId: null,
                topic: '2b287559-12a5-4a95-a420-ee08aad2208c',
            },
        {
            id: '6eebbc37-7025-4ced-be0d-581321e91c11',
            name: 'unsignedintger',
            archived: false,
            children: [],
            force: false,
            parentId: '220832c7-9e86-40e6-bf84-b3bb28eb7c3c',
            topic: '',
        },
            {
                id: '7ebe3c61-20cc-4a5e-8836-603162b273d4',
                name: 'unsignedintger_sup',
                archived: false,
                children: [],
                force: false,
                parentId: '6eebbc37-7025-4ced-be0d-581321e91c11',
                topic: '',
            },
            {
                id: 'c0217492-3c4e-40b4-bd89-26f14e838150',
                name: 'test',
                archived: false,
                children: [],
                force: false,
                parentId: '6eebbc37-7025-4ced-be0d-581321e91c11',
                topic: '',
            },
        {
            id: '5d9210f0-9809-474d-bfbb-287cd05a7fd5',
            name: 'unsignedintger2',
            archived: false,
            children: [],
            force: false,
            parentId: '220832c7-9e86-40e6-bf84-b3bb28eb7c3c',
            topic: '',
        },
            {
                id: '23c816cd-6239-411c-a2ef-a7dcd94430bd',
                name: 'unsignedintger_sup',
                archived: false,
                children: [],
                force: false,
                parentId: '5d9210f0-9809-474d-bfbb-287cd05a7fd5',
                topic: '',
            },
            {
                id: '774374b6-ad61-4b0c-844e-7338412c7d85',
                name: 'test',
                archived: false,
                children: [],
                force: false,
                parentId: '5d9210f0-9809-474d-bfbb-287cd05a7fd5',
                topic: '',
            },
        {
            id: '6636d7bf-8b4f-464e-b1c6-a8ed462b61aa',
            name: 'ParentLongNameMayBeCut',
            archived: false,
            children: [],
            force: false,
            parentId: '220832c7-9e86-40e6-bf84-b3bb28eb7c3c',
            topic: '',
        },
            {
                id: 'cad1904f-2f09-4330-aa22-69387e5e09c6',
                name: 'sub',
                archived: false,
                children: [],
                force: false,
                parentId: '6636d7bf-8b4f-464e-b1c6-a8ed462b61aa',
                topic: '',
            },
    {
        id: 'f56e6d34-1f8b-4065-85b9-b85d8762daaf',
        name: 'tips',
        archived: false,
        children: [],
        force: false,
        parentId: 'a89ae3f4-64c5-49cc-acc9-aaafa4d5ee4c',
        topic: '',
    },
        {
            id: '268e5380-fbd3-4d97-846f-d15cf7f101ce',
            name: 'yasao',
            archived: false,
            children: [],
            force: false,
            parentId: 'f56e6d34-1f8b-4065-85b9-b85d8762daaf',
            topic: '',
        },
            {
                id: '96721686-2267-4ac7-ab6b-cd2780ecfe2d',
                name: 'sub',
                archived: false,
                children: [],
                force: false,
                parentId: "268e5380-fbd3-4d97-846f-d15cf7f101ce",
                topic: '',
            },
            {
                id: '4b8b5efd-7eed-454d-b59d-b76c52658048',
                name: 'bot',
                archived: false,
                children: [],
                force: false,
                parentId: '268e5380-fbd3-4d97-846f-d15cf7f101ce',
                topic: '',
            },
  {
    id: '17da19ef-2744-4550-8468-b01517db2905',
    name: 'team',
    archived: false,
    children: [],
    force: false,
    parentId: null,
    topic: '',
  },
  {
    id: '734b0017-e1d3-4ef1-9200-d45f197b1df5',
    name: 'event',
    archived: false,
    children: [],
    force: false,
    parentId: null,
    topic: '',
  },
    {
        id: '89a71d67-71de-4df5-bebd-abcc0c93614f',
        name: 'hackathon',
        archived: false,
        children: [],
        force: false,
        parentId: '734b0017-e1d3-4ef1-9200-d45f197b1df5',
        topic: '',
    },
        {
            id: "d84082bd-9712-48a7-8329-67a13bf403e2",
            name: '24_spring',
            archived: false,
            children: [],
            force: false,
            parentId: '89a71d67-71de-4df5-bebd-abcc0c93614f',
            topic: '',
        },
            {
                id: "97b6b3ee-760c-45bb-8968-53e71c00e373",
                name: '01',
                archived: false,
                children: [],
                force: false,
                parentId: "d84082bd-9712-48a7-8329-67a13bf403e2",
                topic: '',
            },
                {
                    id: "cc0d6a67-1e6e-424e-be96-6e121698301e",
                    name: 'program',
                    archived: false,
                    children: [],
                    force: false,
                    parentId: "97b6b3ee-760c-45bb-8968-53e71c00e373",
                    topic: '',
                },
            {
                id: "6b57c3fc-6e0b-4d17-bfaa-f071b365a64e",
                name: '02',
                archived: false,
                children: [],
                force: false,
                parentId: "d84082bd-9712-48a7-8329-67a13bf403e2",
                topic: '',
            },
                {
                    id: "1f83dc32-8db0-4237-8440-a0fb4fe52301",
                    name: 'program',
                    archived: false,
                    children: [],
                    force: false,
                    parentId: "6b57c3fc-6e0b-4d17-bfaa-f071b365a64e",
                    topic: '',
                },
        {
            id: "aad91ac9-b68e-4672-81aa-e70d439d1457",
            name: '24_winter',
            archived: false,
            children: [],
            force: false,
            parentId: '89a71d67-71de-4df5-bebd-abcc0c93614f',
            topic: '',
        },
            {
                id: "20d544e4-64af-4849-a631-78b965c60b9c",
                name: '01',
                archived: false,
                children: [],
                force: false,
                parentId: 'aad91ac9-b68e-4672-81aa-e70d439d1457',
                topic: '',
            },
                {
                    id: "ebd67d81-a9e6-4510-8a72-5cdccb0f1116",
                    name: 'program',
                    archived: false,
                    children: [],
                    force: false,
                    parentId: "20d544e4-64af-4849-a631-78b965c60b9c",
                    topic: '',
                },
            {
                id: "f9c17526-2e47-444f-86cf-e0a68e994247",
                name: '02',
                archived: false,
                children: [],
                force: false,
                parentId: 'aad91ac9-b68e-4672-81aa-e70d439d1457',
                topic: '',
            },
                {
                    id: "314c5bb6-9646-43bd-9461-c0bfdbbbcfb5",
                    name: 'program',
                    archived: false,
                    children: [],
                    force: false,
                    parentId: "f9c17526-2e47-444f-86cf-e0a68e994247",
                    topic: '',
                },
  
]