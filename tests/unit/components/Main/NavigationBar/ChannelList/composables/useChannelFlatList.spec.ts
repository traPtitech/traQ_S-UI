import { shallowRef } from 'vue'

import useChannelFlatList from '/@/components/Main/NavigationBar/ChannelList/composables/useChannelFlatList'
import type { ChannelTreeNode } from '/@/lib/channelTree'
import type { ChannelId } from '/@/types/entity-ids'

const createNode = (
  id: string,
  children: ChannelTreeNode[] = []
): ChannelTreeNode => ({
  id: id as ChannelId,
  name: id,
  children,
  active: true,
  archived: false
})

describe('useChannelFlatList', () => {
  const child = createNode('child', [createNode('grandchild')])
  const root = createNode('root', [child])

  it('親を閉じても子孫の展開状態を保持する', () => {
    const { flatItems, expandedNodeKeys, toggle } = useChannelFlatList(
      shallowRef([root])
    )

    toggle('/root')
    toggle('/root/child')
    expect(flatItems.value.map(item => item.key)).toEqual([
      '/root',
      '/root/child',
      '/root/child/grandchild'
    ])

    toggle('/root')
    expect(flatItems.value.map(item => item.key)).toEqual(['/root'])
    expect(expandedNodeKeys.value.has('/root/child')).toBe(true)

    toggle('/root')
    expect(flatItems.value.map(item => item.key)).toEqual([
      '/root',
      '/root/child',
      '/root/child/grandchild'
    ])
  })

  it('一時的にツリーから消えたノードの展開状態を保持する', () => {
    const rootNodes = shallowRef<readonly ChannelTreeNode[]>([root])
    const { flatItems, expandedNodeKeys, toggle } =
      useChannelFlatList(rootNodes)

    toggle('/root')
    rootNodes.value = []
    expect(flatItems.value).toEqual([])
    expect(expandedNodeKeys.value.has('/root')).toBe(true)

    rootNodes.value = [root]
    expect(flatItems.value.map(item => item.key)).toEqual([
      '/root',
      '/root/child'
    ])
  })
})
