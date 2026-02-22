import type { Channel } from '@traptitech/traq'

import { computed } from 'vue'

import useChannelPath from '/@/composables/useChannelPath'
import type { ChannelTreeNode, ClipFolderTreeNode } from '/@/lib/channelTree'

interface TreeProps {
  channelOrClipFolder: ChannelTreeNode
  showShortenedPath: false
}

interface ListProps {
  channelOrClipFolder: Channel
  showShortenedPath: true
}

interface ClipProps {
  channelOrClipFolder: ClipFolderTreeNode
  showShortenedPath: false
}

export type TypedProps = TreeProps | ListProps | ClipProps

export const usePath = (typedProps: TypedProps) => {
  const { channelIdToShortPathString, channelIdToPathString } = useChannelPath()

  const getPathWithAncestor = (skippedAncestorNames?: string[]) =>
    skippedAncestorNames
      ? [...skippedAncestorNames].reverse().join('/').concat('/')
      : ''

  const pathToShow = computed(() => {
    if (
      'type' in typedProps.channelOrClipFolder &&
      typedProps.channelOrClipFolder.type === 'clip-folder'
    ) {
      return typedProps.channelOrClipFolder.name
    }
    if ('showShortenedPath' in typedProps && typedProps.showShortenedPath) {
      return channelIdToShortPathString(typedProps.channelOrClipFolder.id)
    }
    return (
      getPathWithAncestor(typedProps.channelOrClipFolder.skippedAncestorNames) +
      typedProps.channelOrClipFolder.name
    )
  })
  const pathTooltip = computed(() => {
    if (
      'type' in typedProps.channelOrClipFolder &&
      typedProps.channelOrClipFolder.type === 'clip-folder'
    ) {
      return undefined
    }
    if ('showShortenedPath' in typedProps && typedProps.showShortenedPath) {
      return `${channelIdToPathString(typedProps.channelOrClipFolder.id, true) ?? ''}`
    }
    return undefined
  })

  return { pathToShow, pathTooltip }
}
