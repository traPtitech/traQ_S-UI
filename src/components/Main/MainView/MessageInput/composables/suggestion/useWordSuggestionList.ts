import { computed, onBeforeUnmount, ref, toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'

import useChannelPath from '/@/composables/useChannelPath'
import useUserList from '/@/composables/users/useUserList'
import { isDefined } from '/@/lib/basic/array'
import TrieTree from '/@/lib/basic/trieTree'
import { animeEffectSet, sizeEffectSet } from '/@/lib/markdown/effects'
import { type Word, getDeterminedCharacters } from '/@/lib/suggestion/basic'
import { useChannelsStore } from '/@/store/entities/channels'
import { useGroupsStore } from '/@/store/entities/groups'
import type { EntityEventMap } from '/@/store/entities/mitt'
import { entityMitt } from '/@/store/entities/mitt'
import { useStampsStore } from '/@/store/entities/stamps'

const events: Array<keyof EntityEventMap> = [
  'setUser',
  'setUsers',
  'deleteUser',
  'setUserGroup',
  'setUserGroups',
  'deleteUserGroup',
  'setStamp',
  'setStamps',
  'deleteStamp',
  'addChannel',
  'setChannels',
  'updateChannel'
]

const useCandidateTree = () => {
  const userList = useUserList()
  const { userGroupsMap } = useGroupsStore()
  const { stampsMap } = useStampsStore()
  const { channelsMap } = useChannelsStore()
  const { channelIdToPathString } = useChannelPath()

  const constructTree = () =>
    new TrieTree<Word>(
      // ユーザー名とグループ名に重複あり
      // メンションはcase insensitiveでユーザー名を優先
      // 重複を許す場合、優先するものから入れる
      userList.value.map(user => ({
        type: 'user',
        text: `@${user.name}`,
        id: user.id
      })),
      [...userGroupsMap.value.values()].map(userGroup => ({
        type: 'user-group',
        text: `@${userGroup.name}`,
        id: userGroup.id
      })),
      [...stampsMap.value.values()].map(stamp => ({
        type: 'stamp',
        text: `:${stamp.name}`,
        id: stamp.id
      })),
      [...animeEffectSet, ...sizeEffectSet].map(effectName => ({
        type: 'stamp-effect',
        text: `.${effectName}`
      })),
      [...channelsMap.value.values()]
        .map(channel => {
          const path = channelIdToPathString(channel.id, true)
          if (!path) return undefined

          return {
            type: 'channel',
            text: path,
            id: channel.id,
            delimiter: '/'
          } as const
        })
        .filter(isDefined)
    )

  const tree = ref<TrieTree<Word>>(constructTree())
  const updateTree = () => {
    tree.value = constructTree()
  }

  events.forEach(event => {
    entityMitt.on(event, updateTree)
  })
  onBeforeUnmount(() => {
    events.forEach(event => {
      entityMitt.off(event, updateTree)
    })
  })

  return tree
}

const replaceMap: Record<string, string | undefined> = {
  '＠': '@',
  '＃': '#'
}

const replaceRegex = new RegExp(`[${Object.keys(replaceMap).join('|')}]`, 'g')

/**
 * @param minLength 補完が利用できるようになる最小の文字数
 */
const useWordSuggestionList = (
  word: MaybeRefOrGetter<string>,
  minLength: number
) => {
  const tree = useCandidateTree()
  const candidates = computed(() =>
    toValue(word).length >= minLength
      ? tree.value.search(
          toValue(word).replace(replaceRegex, c => replaceMap[c] ?? c),
          { stopAtNextDelimiter: toValue(word).startsWith('#') }
        )
      : []
  )
  const confirmedText = computed(() =>
    getDeterminedCharacters(candidates.value.map(obj => obj.text))
  )

  return {
    suggestedCandidateWords: candidates,
    confirmedText
  }
}

export default useWordSuggestionList
