import { ChannelTree } from '/@/lib/channelTree'

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
