import { onBeforeUnmount, ref } from 'vue'

import TrieTree from '/@/lib/basic/trieTree'
import type { Word } from '/@/lib/suggestion/basic'
import { type EntityEventMap, entityMitt } from '/@/store/entities/mitt'

const useCandidateSearch = (
  getCandidates: () => Word[],
  events: Array<keyof EntityEventMap>
) => {
  const constructTree = () => new TrieTree<Word>(getCandidates())

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
  return (...args: Parameters<TrieTree<Word>['search']>) =>
    tree.value.search(...args)
}

export default useCandidateSearch
