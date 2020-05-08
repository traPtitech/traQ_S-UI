import { ChannelId } from '@/types/entity-ids'

export const rootChannelId = ''

export type RootChannelId = typeof rootChannelId

export interface ChannelTreeNode {
  id: ChannelId
  name: string
  children: ChannelTreeNode[]
  active: boolean
  archived: boolean
  skippedAncestorNames?: string[]
}
export interface ChannelTree {
  children: ChannelTreeNode[]
}

export interface S {
  channelTree: ChannelTree
  homeChannelTree: ChannelTree
}

export const state: S = {
  channelTree: {
    children: []
  },
  homeChannelTree: {
    children: []
  }
}
