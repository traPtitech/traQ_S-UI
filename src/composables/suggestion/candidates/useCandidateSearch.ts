import { computed } from 'vue'

import TrieTree from '/@/lib/basic/trieTree'
import type { Word } from '/@/lib/suggestion/types'

const useCandidateSearch = (getCandidates: () => Word[]) => {
  const tree = computed(() => new TrieTree<Word>(getCandidates()))
  return (...args: Parameters<TrieTree<Word>['search']>) =>
    tree.value.search(...args)
}

export default useCandidateSearch
