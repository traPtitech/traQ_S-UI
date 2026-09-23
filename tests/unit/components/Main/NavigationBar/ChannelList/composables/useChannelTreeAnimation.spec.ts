import { computed, ref, shallowRef } from 'vue'

import type { VirtualItem, Virtualizer } from '@tanstack/vue-virtual'

import type { FlatChannelItem } from '/@/components/Main/NavigationBar/ChannelList/composables/useChannelFlatList'
import useChannelTreeAnimation from '/@/components/Main/NavigationBar/ChannelList/composables/useChannelTreeAnimation'
import type { ChannelTreeNode } from '/@/lib/channelTree'
import type { ChannelId } from '/@/types/entity-ids'

const childNode: ChannelTreeNode = {
  id: 'child' as ChannelId,
  name: 'child',
  children: [],
  active: true,
  archived: false
}
const rootNode: ChannelTreeNode = {
  id: 'root' as ChannelId,
  name: 'root',
  children: [childNode],
  active: true,
  archived: false
}
const siblingNode: ChannelTreeNode = {
  id: 'sibling' as ChannelId,
  name: 'sibling',
  children: [],
  active: true,
  archived: false
}

const rootItem: FlatChannelItem = { node: rootNode, depth: 0, key: '/root' }
const childItem: FlatChannelItem = {
  node: childNode,
  depth: 1,
  key: '/root/child'
}
const siblingItem: FlatChannelItem = {
  node: siblingNode,
  depth: 0,
  key: '/sibling'
}

const virtualItem = (
  index: number,
  key: string,
  start: number
): VirtualItem => ({
  index,
  key,
  start,
  end: start + 36,
  size: 36,
  lane: 0
})

const setup = (initiallyExpanded: boolean) => {
  const isExpanded = ref(initiallyExpanded)
  const expandedNodeKeys = ref(new Set(initiallyExpanded ? ['/root'] : []))
  const flatItems = computed(() =>
    isExpanded.value
      ? [rootItem, childItem, siblingItem]
      : [rootItem, siblingItem]
  )
  const virtualizer = shallowRef({
    getVirtualItems: () =>
      isExpanded.value
        ? [
            virtualItem(0, '/root', 0),
            virtualItem(1, '/root/child', 36),
            virtualItem(2, '/sibling', 72)
          ]
        : [virtualItem(0, '/root', 0), virtualItem(1, '/sibling', 36)],
    getTotalSize: () => (isExpanded.value ? 108 : 72)
  } as unknown as Virtualizer<HTMLElement, HTMLElement>)

  return useChannelTreeAnimation({
    virtualizer,
    flatItems,
    expandedNodeKeys,
    scrollMargin: computed(() => 0),
    toggle: () => {
      isExpanded.value = !isExpanded.value
      expandedNodeKeys.value = new Set(isExpanded.value ? ['/root'] : [])
    }
  })
}

describe('useChannelTreeAnimation', () => {
  it.each([
    ['collapse', true],
    ['expand', false]
  ] as const)(
    '%s時にクリップ境界と後続行の位置を一致させる',
    async (direction, open) => {
      const { treeAnimation, displayedRows, handleToggle } = setup(open)

      handleToggle('/root')
      await vi.waitFor(() => expect(treeAnimation.value).not.toBeNull())

      const animation = treeAnimation.value
      expect(animation).not.toBeNull()
      if (!animation) return

      expect(animation.direction).toBe(direction)
      expect(animation.height).toBe(36)
      expect(animation.rows.map(row => row.key)).toEqual(['/root/child'])
      expect(animation.movingRows.map(row => row.key)).toEqual(['/sibling'])
      expect(animation.movingRows[0]?.start).toBe(0)
      expect(displayedRows.value.map(row => row.key)).toEqual(['/root'])
    }
  )

  it('終了イベントが発火しなくてもアニメーション状態を解除する', async () => {
    vi.useFakeTimers()

    try {
      const { treeAnimation, displayedRows, handleToggle } = setup(false)

      handleToggle('/root')
      await Promise.resolve()
      await Promise.resolve()
      expect(treeAnimation.value).not.toBeNull()

      vi.runOnlyPendingTimers()
      expect(treeAnimation.value).toBeNull()
      expect(displayedRows.value.map(row => row.key)).toEqual([
        '/root',
        '/root/child',
        '/sibling'
      ])
    } finally {
      vi.useRealTimers()
    }
  })

  it('前のアニメーションが終了するまで次の操作を待つ', async () => {
    vi.useFakeTimers()

    try {
      const { treeAnimation, finishTreeAnimation, handleToggle } = setup(false)

      handleToggle('/root')
      handleToggle('/root')
      await Promise.resolve()
      await Promise.resolve()

      const firstAnimation = treeAnimation.value
      expect(firstAnimation?.direction).toBe('expand')
      if (!firstAnimation) return

      finishTreeAnimation(firstAnimation.id)
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()

      expect(treeAnimation.value?.direction).toBe('collapse')
    } finally {
      vi.runOnlyPendingTimers()
      vi.useRealTimers()
    }
  })
})
