import { ChannelId } from '@/types/entity-ids'

export const rootChannelId = ''

export type RootChannelId = typeof rootChannelId

export interface ChannelTreeNode {
  id: ChannelId
  name: string
  children: ChannelTreeNode[]
  active: boolean
  archived: boolean
  /**
   * スキップされた子孫 (子から親への順番)
   */
  skippedAncestorNames?: string[]
}
export interface ChannelTree {
  children: ChannelTreeNode[]
}

export interface S {
  channelTree: Readonly<ChannelTree>
  homeChannelTree: Readonly<ChannelTree>
}

export const state: S = {
  channelTree: {
    children: []
  },
  homeChannelTree: {
    children: []
  }
}
