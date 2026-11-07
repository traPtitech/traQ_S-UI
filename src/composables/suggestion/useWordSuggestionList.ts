import { computed, toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'

import { compareString } from '/@/lib/basic/string'
import { channelSuggestions } from '/@/lib/suggestion/channel'
import type { ChannelWord, SuggestionWord } from '/@/lib/suggestion/types'

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

const mergeMentionCandidates = (
  users: SuggestionWord[],
  userGroups: SuggestionWord[]
) => {
  // ユーザーとグループが同名でも、候補の明示的な選択で対象を識別できる。
  return users.concat(userGroups).sort((a, b) => compareString(a.text, b.text))
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

  const suggestions = computed<{
    words: SuggestionWord[]
    parentChannel?: ChannelWord
  }>(() => {
    const input = toValue(word)

    if (input.length < minLength) {
      return { words: [] }
    }

    const prefix = input.replace(replaceRegex, c => replaceMap[c] ?? c)

    switch (prefix[0]) {
      case '@':
        return {
          words: mergeMentionCandidates(
            searchUser(prefix),
            searchUserGroup(prefix)
          )
        }

      case '#':
        return channelSuggestions(prefix, value =>
          searchChannel(value, { stopAtNextDelimiter: true })
        )

      case ':':
        return { words: searchStamp(prefix) }
      case '.':
        return { words: searchStampEffect(prefix) }
      default:
        return { words: [] }
    }
  })

  return {
    suggestedCandidateWords: computed(() => suggestions.value.words),
    parentChannel: computed(() => suggestions.value.parentChannel)
  }
}

export default useWordSuggestionList
