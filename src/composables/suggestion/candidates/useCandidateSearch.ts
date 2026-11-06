import { computed } from 'vue'

import TrieTree from '/@/lib/basic/trieTree'
import type { Word } from '/@/lib/suggestion/types'

const useCandidateSearch = <T extends Word>(getCandidates: () => T[]) => {
  const tree = computed(() => new TrieTree<T>(getCandidates()))
  return (...args: Parameters<TrieTree<T>['search']>) =>
    tree.value.search(...args)
}

export default useCandidateSearch
