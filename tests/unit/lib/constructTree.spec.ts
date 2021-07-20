import { ChannelTree, constructTree, ChannelLike } from '/@/lib/channelTree'
import { ChannelId } from '/@/types/entity-ids'

describe('constructTree', () => {
  it('can construct tree from entities', () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const constructed = constructTree(channelEntities.get('')!, channelEntities)
    const tree: ChannelTree = {
      children: constructed?.children ?? []
    }
    expect(tree).toEqual(channelTree)
  })
  it('can construct home tree from entities', () => {
    const constructed = constructTree(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      channelEntities.get('')!,
      channelEntities,
      subscribedChannels
    )
    const tree: ChannelTree = {
      children: constructed?.children ?? []
    }
    expect(tree).toEqual(homeChannelTree)
  })
})

const channelEntities = new Map<ChannelId, ChannelLike>([
  [
    '',
    {
      id: '',
      name: '',
      parentId: null,
      archived: false,
      children: ['a', '8', '4', 'aa']
    }
  ],
  [
    'a',
    {
      id: 'a',
      name: 'a',
      parentId: null,
      archived: false,
      children: ['1', '2']
    }
  ],
  [
    '8',
    {
      id: '8',
      name: '8',
      parentId: null,
      archived: false,
      children: ['3', '9']
    }
  ],
  [
    '4',
    {
      id: '4',
      name: '4',
      parentId: null,
      archived: true,
      children: ['10', 'b']
    }
  ],
  [
    '1',
    {
      id: '1',
      name: '1',
      parentId: 'a',
      archived: false,
      children: []
    }
  ],
  [
    '2',
    {
      id: '2',
      name: '2',
      parentId: 'a',
      archived: false,
      children: []
    }
  ],
  [
    '3',
    {
      id: '3',
      name: '3',
      parentId: '8',
      archived: false,
      children: []
    }
  ],
  [
    '9',
    {
      id: '9',
      name: '9',
      parentId: '8',
      archived: false,
      children: []
    }
  ],
  [
    '10',
    {
      id: '10',
      name: '10',
      parentId: '4',
      archived: false,
      children: ['5']
    }
  ],
  [
    'b',
    {
      id: 'b',
      name: 'b',
      parentId: '4',
      archived: false,
      children: ['6', '7', '11']
    }
  ],
  [
    '5',
    {
      id: '5',
      name: '5',
      parentId: '10',
      archived: true,
      children: []
    }
  ],
  [
    '6',
    {
      id: '6',
      name: '6',
      parentId: 'b',
      archived: false,
      children: []
    }
  ],
  [
    '7',
    {
      id: '7',
      name: '7',
      parentId: '7',
      archived: false,
      children: []
    }
  ],
  [
    '11',
    {
      id: '11',
      name: '11',
      parentId: 'b',
      archived: false,
      children: []
    }
  ],
  [
    'aa',
    {
      id: 'aa',
      name: 'aa',
      parentId: null,
      archived: false,
      children: ['aa1']
    }
  ],
  [
    'aa1',
    {
      id: 'aa1',
      name: 'aa1',
      parentId: 'aa',
      archived: false,
      children: ['aa11']
    }
  ],
  [
    'aa11',
    {
      id: 'aa11',
      name: 'aa11',
      parentId: 'aa1',
      archived: false,
      children: []
    }
  ]
])

const channelTree: ChannelTree = {
  children: [
    {
      id: '4',
      name: '4',
      active: true,
      archived: true,
      children: [
        {
          id: '10',
          name: '10',
          active: true,
          archived: false,
          children: [
            { id: '5', name: '5', active: true, archived: true, children: [] }
          ]
        },
        {
          id: 'b',
          name: 'b',
          active: true,
          archived: false,
          children: [
            {
              id: '11',
              name: '11',
              active: true,
              archived: false,
              children: []
            },
            { id: '6', name: '6', active: true, archived: false, children: [] },
            { id: '7', name: '7', active: true, archived: false, children: [] }
          ]
        }
      ]
    },
    {
      id: '8',
      name: '8',
      active: true,
      archived: false,
      children: [
        { id: '3', name: '3', active: true, archived: false, children: [] },
        { id: '9', name: '9', active: true, archived: false, children: [] }
      ]
    },
    {
      id: 'a',
      name: 'a',
      active: true,
      archived: false,
      children: [
        { id: '1', name: '1', active: true, archived: false, children: [] },
        { id: '2', name: '2', active: true, archived: false, children: [] }
      ]
    },
    {
      id: 'aa',
      name: 'aa',
      active: true,
      archived: false,
      children: [
        {
          id: 'aa1',
          name: 'aa1',
          active: true,
          archived: false,
          children: [
            {
              id: 'aa11',
              name: 'aa11',
              active: true,
              archived: false,
              children: []
            }
          ]
        }
      ]
    }
  ]
}

const homeChannelTree: ChannelTree = {
  children: [
    {
      id: '3',
      name: '3',
      active: true,
      children: [],
      skippedAncestorNames: ['8'],
      archived: false
    },
    {
      id: '4',
      name: '4',
      active: true,
      archived: true,
      children: [
        {
          id: '5',
          name: '5',
          active: true,
          children: [],
          skippedAncestorNames: ['10'],
          archived: true
        },
        {
          id: 'b',
          name: 'b',
          active: false,
          children: [
            { id: '6', name: '6', active: true, children: [], archived: false },
            { id: '7', name: '7', active: true, children: [], archived: false }
          ],
          archived: false
        }
      ]
    },
    {
      id: 'a',
      name: 'a',
      active: false,
      children: [
        { id: '1', name: '1', active: true, children: [], archived: false },
        { id: '2', name: '2', active: true, children: [], archived: false }
      ],
      archived: false
    },
    {
      id: 'aa11',
      name: 'aa11',
      active: true,
      children: [],
      skippedAncestorNames: ['aa1', 'aa'],
      archived: false
    }
  ]
}

const subscribedChannels: Set<ChannelId> = new Set([
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  'aa11'
])
