import { computed } from 'vue'

import useChannelPath from '/@/composables/useChannelPath'
import type { ChannelTreeNode } from '/@/lib/channelTree'

interface PathProps {
  channel: ChannelTreeNode
  showShortenedPath: boolean
}

export const usePath = (props: PathProps) => {
  const { channelIdToShortPathString, channelIdToPathString } = useChannelPath()

  const getPathWithAncestor = (skippedAncestorNames?: string[]) =>
    skippedAncestorNames
      ? [...skippedAncestorNames].reverse().join('/').concat('/')
      : ''

  const pathToShow = computed(() =>
    props.showShortenedPath
      ? channelIdToShortPathString(props.channel.id)
      : getPathWithAncestor(props.channel.skippedAncestorNames) +
        props.channel.name
  )
  const pathTooltip = computed(() =>
    props.showShortenedPath
      ? `${channelIdToPathString(props.channel.id, true) ?? ''}`
      : undefined
  )

  return { pathToShow, pathTooltip }
}
