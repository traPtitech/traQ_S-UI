import { ChannelTree } from '@/store/domain/channelTree/state'
import { constructTree, ChannelLike } from '@/store/domain/channelTree/actions'
import { ChannelId } from '@/types/entity-ids'

describe('constructTree', () => {
  it('can construct tree from entities', () => {
    const constructed = constructTree(channelEntities[''], channelEntities)
    const tree: ChannelTree = {
      children: constructed?.children ?? []
    }
    expect(tree).toEqual(channelTree)
  })
  it('can construct home tree from entities', () => {
    const constructed = constructTree(
      channelEntities[''],
      channelEntities,
      subscribedChannels
    )
    const tree: ChannelTree = {
      children: constructed?.children ?? []
    }
    expect(tree).toEqual(homeChannelTree)
  })
})

const channelEntities: Record<ChannelId, ChannelLike> = {
  '': {
    id: '',
    name: '',
    parentId: null,
    children: ['a', '8', '4']
  },
  a: {
    id: 'a',
    name: 'a',
    parentId: null,
    children: ['1', '2']
  },
  '8': {
    id: '8',
    name: '8',
    parentId: null,
    children: ['3', '9']
  },
  '4': {
    id: '4',
    name: '4',
    parentId: null,
    children: ['10', 'b']
  },
  '1': {
    id: '1',
    name: '1',
    parentId: 'a',
    children: []
  },
  '2': {
    id: '2',
    name: '2',
    parentId: 'a',
    children: []
  },
  '3': {
    id: '3',
    name: '3',
    parentId: '8',
    children: []
  },
  '9': {
    id: '9',
    name: '9',
    parentId: '8',
    children: []
  },
  '10': {
    id: '10',
    name: '10',
    parentId: '4',
    children: ['5']
  },
  b: {
    id: 'b',
    name: 'b',
    parentId: '4',
    children: ['6', '7', '11']
  },
  '5': {
    id: '5',
    name: '5',
    parentId: '10',
    children: []
  },
  '6': {
    id: '6',
    name: '6',
    parentId: 'b',
    children: []
  },
  '7': {
    id: '7',
    name: '7',
    parentId: '7',
    children: []
  },
  '11': {
    id: '11',
    name: '11',
    parentId: 'b',
    children: []
  }
}

const channelTree: ChannelTree = {
  children: [
    {
      id: '4',
      name: '4',
      active: true,
      children: [
        {
          id: '10',
          name: '10',
          active: true,
          children: [{ id: '5', name: '5', active: true, children: [] }]
        },
        {
          id: 'b',
          name: 'b',
          active: true,
          children: [
            { id: '11', name: '11', active: true, children: [] },
            { id: '6', name: '6', active: true, children: [] },
            { id: '7', name: '7', active: true, children: [] }
          ]
        }
      ]
    },
    {
      id: '8',
      name: '8',
      active: true,
      children: [
        { id: '3', name: '3', active: true, children: [] },
        { id: '9', name: '9', active: true, children: [] }
      ]
    },
    {
      id: 'a',
      name: 'a',
      active: true,
      children: [
        { id: '1', name: '1', active: true, children: [] },
        { id: '2', name: '2', active: true, children: [] }
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
      skippedAncestorNames: ['8']
    },
    {
      id: '4',
      name: '4',
      active: true,
      children: [
        {
          id: '5',
          name: '5',
          active: true,
          children: [],
          skippedAncestorNames: ['10']
        },
        {
          id: 'b',
          name: 'b',
          active: false,
          children: [
            { id: '6', name: '6', active: true, children: [] },
            { id: '7', name: '7', active: true, children: [] }
          ]
        }
      ]
    },
    {
      id: 'a',
      name: 'a',
      active: false,
      children: [
        { id: '1', name: '1', active: true, children: [] },
        { id: '2', name: '2', active: true, children: [] }
      ]
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
  '7'
])
