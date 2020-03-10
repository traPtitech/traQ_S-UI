import { ChannelId } from '@/types/entity-ids'

export const rootChannelId = ''
export const dmChannelId = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa'

export type RootChannelId = typeof rootChannelId
export type DmChannelId = typeof dmChannelId

export interface ChannelTreeNode {
  channelId: ChannelId
  name: string
  children: ChannelTreeNode[]
  active: boolean
}
export interface ChannelTree<Root> {
  channelId: Root
  name: string
  active: true
  children: ChannelTreeNode[]
}

export interface S {
  channelTree: ChannelTree<RootChannelId>
  homeChannelTree: ChannelTree<RootChannelId>
  dmChannelTree: ChannelTree<DmChannelId>
}

export const state: S = {
  channelTree: {
    channelId: rootChannelId,
    name: '',
    active: true,
    children: []
  },
  homeChannelTree: {
    channelId: rootChannelId,
    name: '',
    active: true,
    children: []
  },
  dmChannelTree: {
    channelId: dmChannelId,
    name: '',
    active: true,
    children: []
  }
}
