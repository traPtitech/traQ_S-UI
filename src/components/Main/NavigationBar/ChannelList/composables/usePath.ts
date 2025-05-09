import type { Channel } from '@traptitech/traq'
import { computed } from 'vue'
import useChannelPath from '/@/composables/useChannelPath'
import type { ChannelTreeNode } from '/@/lib/channelTree'

interface TreeProps {
  channel: ChannelTreeNode
  showShortenedPath: false
}

interface ListProps {
  channel: Channel
  showShortenedPath: true
}

export type TypedProps = TreeProps | ListProps

export const usePath = (typedProps: TypedProps) => {
  const { channelIdToShortPathString, channelIdToPathString } = useChannelPath()

  const getPathWithAncestor = (skippedAncestorNames?: string[]) =>
    skippedAncestorNames
      ? [...skippedAncestorNames].reverse().join('/').concat('/')
      : ''

  const pathToShow = computed(() =>
    typedProps.showShortenedPath
      ? channelIdToShortPathString(typedProps.channel.id)
      : getPathWithAncestor(typedProps.channel.skippedAncestorNames) +
        typedProps.channel.name
  )
  const pathTooltip = computed(() =>
    typedProps.showShortenedPath
      ? `#${channelIdToPathString(typedProps.channel.id)}`
      : undefined
  )

  return { pathToShow, pathTooltip }
}
