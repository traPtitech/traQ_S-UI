import { ChannelTree } from '@/store/domain/channelTree/state'
import { constructTree } from '@/store/domain/channelTree/mutations'
import { ChannelId } from '@/types/entity-ids'
import { Channel } from 'traq-api-v2'

describe('constructTree', () => {
  it('can construct tree from entities', () => {
    const constructed = constructTree('', channelEntities)
    expect(constructed).toEqual(channelTree)
  })
  it('can construct home tree from entities', () => {
    const constructed = constructTree('', channelEntities, subscribedChannels)
    expect(constructed).toEqual(homeChannelTree)
  })
})

const channelEntities: Record<ChannelId, Channel> = {
  '': {
    channelId: '',
    name: '',
    parent: undefined,
    children: ['a', '8', '4']
  },
  a: {
    channelId: '',
    name: 'a',
    parent: '',
    children: ['1', '2']
  },
  '8': {
    channelId: '8',
    name: '8',
    parent: '',
    children: ['3', '9']
  },
  '4': {
    channelId: '4',
    name: '4',
    parent: '',
    children: ['10', 'b']
  },
  '1': {
    channelId: '1',
    name: '1',
    parent: 'a'
  },
  '2': {
    channelId: '2',
    name: '2',
    parent: 'a'
  },
  '3': {
    channelId: '3',
    name: '3',
    parent: '8'
  },
  '9': {
    channelId: '9',
    name: '9',
    parent: '8'
  },
  '10': {
    channelId: '10',
    name: '10',
    parent: '4',
    children: ['5']
  },
  b: {
    channelId: 'b',
    name: 'b',
    parent: '4',
    children: ['6', '7', '11']
  },
  '5': {
    channelId: '5',
    name: '5',
    parent: '10'
  },
  '6': {
    channelId: '6',
    name: '6',
    parent: 'b'
  },
  '7': {
    channelId: '7',
    name: '7',
    parent: '7'
  },
  '11': {
    channelId: '11',
    name: '11',
    parent: 'b'
  }
}

const channelTree: ChannelTree<''> = {
  channelId: '',
  name: '',
  active: true,
  children: [
    {
      channelId: '4',
      name: '4',
      active: true,
      children: [
        {
          channelId: '10',
          name: '10',
          active: true,
          children: [{ channelId: '5', name: '5', active: true, children: [] }]
        },
        {
          channelId: 'b',
          name: 'b',
          active: true,
          children: [
            { channelId: '11', name: '11', active: true, children: [] },
            { channelId: '6', name: '6', active: true, children: [] },
            { channelId: '7', name: '7', active: true, children: [] }
          ]
        }
      ]
    },
    {
      channelId: '8',
      name: '8',
      active: true,
      children: [
        { channelId: '3', name: '3', active: true, children: [] },
        { channelId: '9', name: '9', active: true, children: [] }
      ]
    },
    {
      channelId: 'a',
      name: 'a',
      active: true,
      children: [
        { channelId: '1', name: '1', active: true, children: [] },
        { channelId: '2', name: '2', active: true, children: [] }
      ]
    }
  ]
}

const homeChannelTree: ChannelTree<''> = {
  channelId: '',
  name: '',
  active: true,
  children: [
    {
      channelId: '3',
      name: '3',
      active: true,
      children: [],
      skippedAncestorNames: ['8']
    },
    {
      channelId: '4',
      name: '4',
      active: true,
      children: [
        {
          channelId: '5',
          name: '5',
          active: true,
          children: [],
          skippedAncestorNames: ['10']
        },
        {
          channelId: 'b',
          name: 'b',
          active: false,
          children: [
            { channelId: '6', name: '6', active: true, children: [] },
            { channelId: '7', name: '7', active: true, children: [] }
          ]
        }
      ]
    },
    {
      channelId: 'a',
      name: 'a',
      active: false,
      children: [
        { channelId: '1', name: '1', active: true, children: [] },
        { channelId: '2', name: '2', active: true, children: [] }
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
