import { computed } from 'vue'

import TrieTree from '/@/lib/basic/trieTree'
import type { SuggestionWord } from '/@/lib/suggestion/types'

const useCandidateSearch = <T extends SuggestionWord>(
  getCandidates: () => T[]
) => {
  const tree = computed(() => new TrieTree<T>(getCandidates()))
  return (...args: Parameters<TrieTree<T>['search']>) =>
    tree.value.search(...args)
}

export default useCandidateSearch
