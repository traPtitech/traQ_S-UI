import { computed, toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'

import { type Word, getDeterminedCharacters } from '/@/lib/suggestion/basic'

import useChannelCandidateSearch from './candidates/useChannelCandidateSearch'
import useStampCandidateSearch from './candidates/useStampCandidateSearch'
import useStampEffectCandidateSearch from './candidates/useStampEffectCandidateSearch'
import useUserCandidateSearch from './candidates/useUserCandidateSearch'
import useUserGroupCandidateSearch from './candidates/useUserGroupCandidateSearch'

const replaceMap: Record<string, string | undefined> = {
  '＠': '@',
  '＃': '#'
}

const replaceRegex = new RegExp(`[${Object.keys(replaceMap).join('|')}]`, 'g')

const mergeMentionCandidates = (users: Word[], userGroups: Word[]) => {
  const userNameSet = new Set(users.map(user => user.text.toLocaleLowerCase()))
  return users
    .concat(
      userGroups.filter(
        userGroup => !userNameSet.has(userGroup.text.toLocaleLowerCase())
      )
    )
    .sort((a, b) => (a.text < b.text ? -1 : 1))
}
/**
 * @param minLength 補完が利用できるようになる最小の文字数
 */
const useWordSuggestionList = (
  word: MaybeRefOrGetter<string>,
  minLength: number
) => {
  const searchUser = useUserCandidateSearch()
  const searchUserGroup = useUserGroupCandidateSearch()
  const searchStamp = useStampCandidateSearch()
  const searchStampEffect = useStampEffectCandidateSearch()
  const searchChannel = useChannelCandidateSearch()

  const candidates = computed(() => {
    const input = toValue(word)
    if (input.length < minLength) {
      return []
    }

    const prefix = input.replace(replaceRegex, c => replaceMap[c] ?? c)

    switch (prefix[0]) {
      case '@':
        return mergeMentionCandidates(
          searchUser(prefix),
          searchUserGroup(prefix)
        )
      case '#':
        return searchChannel(prefix, { stopAtNextDelimiter: true })

      case ':':
        return searchStamp(prefix)
      case '.':
        return searchStampEffect(prefix)
      default:
        return []
    }
  })

  const confirmedText = computed(() =>
    getDeterminedCharacters(candidates.value.map(obj => obj.text))
  )

  return {
    suggestedCandidateWords: candidates,
    confirmedText
  }
}

export default useWordSuggestionList
