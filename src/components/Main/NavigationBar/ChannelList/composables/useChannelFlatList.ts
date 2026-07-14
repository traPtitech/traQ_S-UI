import { computed, ref } from 'vue'
import type { Ref } from 'vue'

import type { ChannelTreeNode } from '/@/lib/channelTree'

/**
 * チャンネルツリーに並んでいるチャンネルの1行分を表す型。
 */
export interface FlatChannelItem {
  /** チャンネルのノード */
  node: ChannelTreeNode
  /** ネストの深さ。トップレベルが 0。ひとつずつ増えていく。 */
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
  // 現在展開されているチャンネルのノードのkeyの集合
  const expandedNodeKeys = ref(new Set<string>())

  // ルートとなるノードと、現在展開されているノードの情報から、表示すべきノードのリストを作る
  // 仮想スクロールのため、すべての階層のチャンネルをフラットにならべる必要がある。
  const flatItems = computed((): FlatChannelItem[] => {
    const result: FlatChannelItem[] = []

    // 再帰的にチャンネルをたどり、ノードをフラットに並べる関数
    const traverse = (
      nodes: readonly ChannelTreeNode[],
      depth: number,
      parentKey: string
    ) => {
      for (const node of nodes) {
        // 親のkeyに自分のidをつなげて、ツリー上の位置を表すkeyを作る
        const key = `${parentKey}/${node.id}`
        result.push({ node, depth, key })
        // 展開されているノードに含まれていて、かつ、子ノードがある場合は、子ノードをたどる
        if (expandedNodeKeys.value.has(key) && node.children.length > 0) {
          // 再帰的に子ノードをたどる。階層は1つ深くなる。自分のkeyを親のkeyとして渡す。
          traverse(node.children, depth + 1, key)
        }
      }
    }
    traverse(rootNodes.value, 0, '')
    return result
  })

  // keyに対応するノードが展開されているかどうかを切り替える関数
  const toggle = (itemKey: string) => {
    const next = new Set(expandedNodeKeys.value)
    if (next.has(itemKey)) {
      // 展開されている場合は、展開を閉じる（リストから消す）。
      next.delete(itemKey)
      // 展開を閉じたチャンネルの子孫のチャンネルもすべて閉じる。
      // idをつなげてkeyを作っているので、子孫のチャンネルのkeyは、親のkeyで始まる。
      for (const key of next) {
        if (key.startsWith(`${itemKey}/`)) next.delete(key)
      }
    } else {
      // 展開されていない場合は、展開する（リストに追加する）。
      next.add(itemKey)
    }
    expandedNodeKeys.value = next
  }

  return {
    /** フラット化されたチャンネルのリスト */
    flatItems,
    /** 現在展開されているチャンネルのノードのkeyの集合 */
    expandedNodeKeys,
    /** keyに対応するノードが展開されているかどうかを切り替える関数 */
    toggle
  }
}

export default useChannelFlatList
