import type { ChannelTree, ChannelLike } from '/@/lib/channelTree'
import { constructTree, constructTreeFromIds } from '/@/lib/channelTree'
import type { ChannelId } from '/@/types/entity-ids'

describe('constructTree', () => {
  it('can construct tree from entities', () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const constructed = constructTree(channelEntities.get('')!, channelEntities)
    const tree: ChannelTree = {
      children: constructed?.children ?? []
    }
    expect(tree).toStrictEqual(channelTree)
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
    expect(tree).toStrictEqual(homeChannelTree)
  })
})

describe('constructTreeFromIds', () => {
  it('can construct tree from empty ids', () => {
    const constructed = constructTreeFromIds([], channelEntities)
    expect(constructed).toStrictEqual([])
  })
  it('can construct tree from ids', () => {
    const constructed = constructTreeFromIds(['2', '41'], channelEntities)
    expect(constructed).toStrictEqual([
      {
        id: '2',
        name: '2',
        active: true,
        archived: false,
        children: [
          { id: '21', name: '21', active: true, archived: false, children: [] },
          { id: '22', name: '22', active: true, archived: false, children: [] }
        ]
      },
      {
        id: '41',
        name: '41',
        active: true,
        archived: false,
        children: [
          {
            id: '411',
            name: '411',
            active: true,
            archived: false,
            children: []
          }
        ]
      }
    ])
  })
})

const channelEntities = new Map<ChannelId, ChannelLike>(
  [
    {
      id: '',
      name: '',
      parentId: null,
      archived: false,
      children: ['1', '2', '3', '4', '5']
    },
    {
      id: '1',
      name: '1',
      parentId: null,
      archived: true,
      children: ['11', '12']
    },
    {
      id: '11',
      name: '11',
      parentId: '1',
      archived: false,
      children: ['111']
    },
    {
      id: '12',
      name: '12',
      parentId: '1',
      archived: false,
      children: ['122', '123', '121']
    },
    {
      id: '111',
      name: '111',
      parentId: '11',
      archived: true,
      children: []
    },
    {
      id: '121',
      name: '121',
      parentId: '12',
      archived: false,
      children: []
    },
    {
      id: '122',
      name: '122',
      parentId: '12',
      archived: false,
      children: []
    },
    {
      id: '123',
      name: '123',
      parentId: '123',
      archived: false,
      children: []
    },
    {
      id: '2',
      name: '2',
      parentId: null,
      archived: false,
      children: ['21', '22']
    },
    {
      id: '21',
      name: '21',
      parentId: '2',
      archived: false,
      children: []
    },
    {
      id: '22',
      name: '22',
      parentId: '2',
      archived: false,
      children: []
    },
    {
      id: '3',
      name: '3',
      parentId: null,
      archived: false,
      children: ['31', '32']
    },
    {
      id: '31',
      name: '31',
      parentId: '3',
      archived: false,
      children: []
    },
    {
      id: '32',
      name: '32',
      parentId: '3',
      archived: false,
      children: []
    },
    {
      id: '4',
      name: '4',
      parentId: null,
      archived: false,
      children: ['41']
    },
    {
      id: '41',
      name: '41',
      parentId: '4',
      archived: false,
      children: ['411']
    },
    {
      id: '411',
      name: '411',
      parentId: '41',
      archived: false,
      children: []
    },
    {
      id: '5',
      name: '5',
      parentId: null,
      archived: false,
      children: ['51']
    },
    {
      id: '51',
      name: '51',
      parentId: '5',
      archived: false,
      children: []
    }
  ].map(channel => [channel.id, channel])
)

const channelTree: ChannelTree = {
  children: [
    {
      id: '1',
      name: '1',
      active: true,
      archived: true,
      children: [
        {
          id: '11',
          name: '11',
          active: true,
          archived: false,
          children: [
            {
              id: '111',
              name: '111',
              active: true,
              archived: true,
              children: []
            }
          ]
        },
        {
          id: '12',
          name: '12',
          active: true,
          archived: false,
          children: [
            {
              id: '121',
              name: '121',
              active: true,
              archived: false,
              children: []
            },
            {
              id: '122',
              name: '122',
              active: true,
              archived: false,
              children: []
            },
            {
              id: '123',
              name: '123',
              active: true,
              archived: false,
              children: []
            }
          ]
        }
      ]
    },
    {
      id: '2',
      name: '2',
      active: true,
      archived: false,
      children: [
        { id: '21', name: '21', active: true, archived: false, children: [] },
        { id: '22', name: '22', active: true, archived: false, children: [] }
      ]
    },
    {
      id: '3',
      name: '3',
      active: true,
      archived: false,
      children: [
        { id: '31', name: '31', active: true, archived: false, children: [] },
        { id: '32', name: '32', active: true, archived: false, children: [] }
      ]
    },
    {
      id: '4',
      name: '4',
      active: true,
      archived: false,
      children: [
        {
          id: '41',
          name: '41',
          active: true,
          archived: false,
          children: [
            {
              id: '411',
              name: '411',
              active: true,
              archived: false,
              children: []
            }
          ]
        }
      ]
    },
    {
      id: '5',
      name: '5',
      active: true,
      archived: false,
      children: [
        {
          id: '51',
          name: '51',
          active: true,
          archived: false,
          children: []
        }
      ]
    }
  ]
}

const homeChannelTree: ChannelTree = {
  children: [
    {
      id: '1',
      name: '1',
      active: true,
      archived: true,
      children: [
        {
          id: '12',
          name: '12',
          active: false,
          children: [
            {
              id: '122',
              name: '122',
              active: true,
              children: [],
              archived: false
            },
            {
              id: '123',
              name: '123',
              active: true,
              children: [],
              archived: false
            }
          ],
          archived: false
        }
      ]
    },
    {
      id: '21',
      name: '21',
      active: true,
      children: [],
      skippedAncestorNames: ['2'],
      archived: false
    },
    {
      id: '3',
      name: '3',
      active: false,
      children: [
        { id: '31', name: '31', active: true, children: [], archived: false },
        { id: '32', name: '32', active: true, children: [], archived: false }
      ],
      archived: false
    },
    {
      id: '411',
      name: '411',
      active: true,
      children: [],
      skippedAncestorNames: ['41', '4'],
      archived: false
    }
  ]
}

const subscribedChannels: Set<ChannelId> = new Set([
  '31',
  '32',
  '21',
  '1',
  '111',
  '122',
  '123',
  '411'
])
