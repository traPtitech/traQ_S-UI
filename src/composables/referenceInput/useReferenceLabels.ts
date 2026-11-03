import useChannelPath from '/@/composables/useChannelPath'
import {
  type InputMode,
  type Reference,
  inputText,
  parseInput,
  searchOperator
} from '/@/lib/references'
import { useChannelsStore } from '/@/store/entities/channels'
import { useGroupsStore } from '/@/store/entities/groups'
import { useUsersStore } from '/@/store/entities/users'

const useReferenceLabels = () => {
  const { usersMap } = useUsersStore()
  const { userGroupsMap } = useGroupsStore()
  const { dmChannelsMap, channelsMap } = useChannelsStore()
  const { channelIdToPathString } = useChannelPath()

  const legacyReferenceKind = (reference: Reference) => {
    if (reference.type === 'search-in')
      return dmChannelsMap.value.has(reference.id) ? 'dm' : 'channel'

    if (reference.type === 'search-from' || reference.type === 'search-to')
      return usersMap.value.has(reference.id) ? 'user' : 'group'

    return reference.type
  }

  const label = (reference: Reference) => {
    const operator = searchOperator(reference)

    const kind = reference.kind ?? legacyReferenceKind(reference)
    let name: string | undefined

    switch (kind) {
      case 'user':
        {
          const user = usersMap.value.get(reference.id)
          if (user) name = `@${user.name}`
        }

        break

      case 'group':
        {
          const group = userGroupsMap.value.get(reference.id)
          if (group) name = `@${group.name}`
        }

        break

      case 'channel':
        {
          if (channelsMap.value.has(reference.id)) {
            name = channelIdToPathString(reference.id, true) ?? undefined
          }
        }

        break

      case 'dm':
        {
          const userId = dmChannelsMap.value.get(reference.id)?.userId
          const user = userId && usersMap.value.get(userId)
          if (user) name = `@${user.name}`
        }

        break
    }

    return name ? (operator ? `${operator}:${name}` : name) : reference.raw
  }

  const displayInput = (source: string, mode: InputMode) =>
    inputText(parseInput(source, mode), label)

  return { label, displayInput }
}

export default useReferenceLabels
