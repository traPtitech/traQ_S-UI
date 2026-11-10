import type { ChannelTreeNode } from '/@/lib/channelTree'

export interface ChannelTreeProps {
  channels: ReadonlyArray<ChannelTreeNode>
  showShortenedPath?: boolean
  showTopic?: boolean
  showChildTopic?: boolean
  showStar?: boolean
  showNotified?: boolean
}

export interface VirtualChannelTreeProps extends ChannelTreeProps {
  scrollElement: HTMLElement | null
  scrollMargin?: number
}
