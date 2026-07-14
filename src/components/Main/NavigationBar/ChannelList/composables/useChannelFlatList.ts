import { computed, ref } from 'vue'
import type { Ref } from 'vue'

import type { ChannelTreeNode } from '/@/lib/channelTree'

export interface FlatChannelItem {
  node: ChannelTreeNode
  depth: number
  /**
   * ツリー上の位置を一意に表す文字列。ルートから対象のノードまでの id を "/" で連結したもの。
   * 同じチャンネルが異なる場所に同時に現れることがある。例えば、チャンネル名検索で、
   * 親と子が両方マッチした場合、子は2度登場することになる。仮想スクロールのキーは、
   * これらを区別できるようにする必要がある。そこで、該当のチャンネルidだけでなく、
   * 祖先のidもすべて含めるようにする。
   */
  key: string
}

const useChannelFlatList = (rootNodes: Ref<readonly ChannelTreeNode[]>) => {
  const expandedNodeKeys = ref(new Set<string>())

  const flatItems = computed((): FlatChannelItem[] => {
    const result: FlatChannelItem[] = []

    const traverse = (
      nodes: readonly ChannelTreeNode[],
      depth: number,
      parentKey: string
    ) => {
      for (const node of nodes) {
        const key = `${parentKey}/${node.id}`
        result.push({ node, depth, key })
        if (expandedNodeKeys.value.has(key) && node.children.length > 0) {
          traverse(node.children, depth + 1, key)
        }
      }
    }
    traverse(rootNodes.value, 0, '')
    return result
  })

  const toggle = (itemKey: string) => {
    const next = new Set(expandedNodeKeys.value)
    if (next.has(itemKey)) {
      next.delete(itemKey)
    } else {
      next.add(itemKey)
    }
    expandedNodeKeys.value = next
  }

  return {
    flatItems,
    expandedNodeKeys,
    toggle
  }
}

export default useChannelFlatList
