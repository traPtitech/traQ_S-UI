import type { HtmlRendererOptions } from '@traq-flavored-markdown/sdk/renderer'

import useChannelPath from '/@/composables/useChannelPath'
import { buildFilePath, embeddingOrigin } from '/@/lib/apis'
import { useMeStore } from '/@/store/domain/me'
import { useGroupsStore } from '/@/store/entities/groups'
import { useStampsStore } from '/@/store/entities/stamps'
import { useUsersStore } from '/@/store/entities/users'

export const presentation: HtmlRendererOptions = {
  references: {
    resolve(reference) {
      const { detail } = useMeStore()
      switch (reference.type) {
        case 'channel': {
          const { channelIdToLink } = useChannelPath()
          return { href: `${embeddingOrigin}${channelIdToLink(reference.id)}` }
        }
        case 'user':
          return {
            href: `${embeddingOrigin}/users/${encodeURIComponent(reference.id)}`,
            highlight: reference.id === detail.value?.id
          }
        case 'group': {
          const { userGroupsMap } = useGroupsStore()
          return {
            href: `${embeddingOrigin}/groups/${encodeURIComponent(reference.id)}`,
            highlight: userGroupsMap.value
              .get(reference.id)
              ?.members.some(member => member.id === detail.value?.id)
          }
        }
      }
    }
  },
  stamps: {
    resolve(stamp) {
      const fileId =
        stamp.type === 'normal'
          ? useStampsStore().getStampByName(stamp.name)?.fileId
          : useUsersStore().findUserByName(stamp.name)?.iconFileId
      return fileId
        ? {
            url: buildFilePath(fileId),
            title: stamp.type === 'user' ? `@${stamp.name}` : stamp.name
          }
        : undefined
    }
  }
}
