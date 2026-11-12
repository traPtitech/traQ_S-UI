import { computed, effectScope, ref, shallowRef } from 'vue'
import type { EffectScope } from 'vue'

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

const scopes: EffectScope[] = []

const setup = (initiallyExpanded: boolean, childCount = 1) => {
  const scope = effectScope()
  scopes.push(scope)
  const scrollElement = shallowRef(document.createElement('div'))
  const visibleIndices = ref<Set<number> | null>(null)
  const children = Array.from({ length: childCount }, (_, index) =>
    index === 0
      ? childItem
      : {
          ...childItem,
          key: `/root/child-${index}`,
          node: { ...childNode, id: `child-${index}` as ChannelId }
        }
  )
  const isExpanded = ref(initiallyExpanded)
  const expandedNodeKeys = ref(new Set(initiallyExpanded ? ['/root'] : []))
  const flatItems = computed(() =>
    isExpanded.value
      ? [rootItem, ...children, siblingItem]
      : [rootItem, siblingItem]
  )

  const measurements = computed(() =>
    flatItems.value.map((item, index) =>
      virtualItem(index, item.key, index * 36)
    )
  )
  const resizeItem = vi.fn()
  const virtualizer = shallowRef({
    options: { overscan: 5 },
    scrollRect: { height: 108 },
    get measurementsCache() {
      // TanStack の単一列キャッシュは、添字アクセスで値を生成する疎な配列。
      const items = measurements.value
      return new Proxy(new Array<VirtualItem>(items.length), {
        get: (target, property, receiver) =>
          typeof property === 'string' && /^\d+$/.test(property)
            ? items[Number(property)]
            : Reflect.get(target, property, receiver)
      })
    },
    getVirtualItems: () =>
      measurements.value.filter(
        item => !visibleIndices.value || visibleIndices.value.has(item.index)
      ),
    getTotalSize: () => flatItems.value.length * 36,
    resizeItem
  } as unknown as Virtualizer<HTMLElement, HTMLElement>)

  const animation = scope.run(() =>
    useChannelTreeAnimation({
      virtualizer,
      flatItems,
      expandedNodeKeys,
      scrollElement,
      scrollMargin: computed(() => 0),
      toggle: () => {
        isExpanded.value = !isExpanded.value
        expandedNodeKeys.value = new Set(isExpanded.value ? ['/root'] : [])
      }
    })
  )
  if (!animation) throw new Error('Animation scope is inactive')
  return { ...animation, scrollElement, visibleIndices, resizeItem }
}

describe('useChannelTreeAnimation', () => {
  afterEach(() => {
    for (const scope of scopes.splice(0)) scope.stop()
  })

  it('展開後の仮想範囲から外れた後続行も、アニメーション中は保持する', async () => {
    const { visibleAnimation, handleToggle, visibleIndices } = setup(
      false,
      1000
    )
    visibleIndices.value = new Set([0, 1])
    handleToggle('/root')
    await vi.waitFor(() => expect(visibleAnimation.value).not.toBeNull())

    expect(visibleAnimation.value?.movingRows.map(row => row.key)).toContain(
      '/sibling'
    )
    expect(visibleAnimation.value?.rows.length).toBeLessThan(20)
  })

  it.each([false, true])(
    '展開状態 %s からのアニメーション中にスクロールしても、表示範囲を更新し、次の操作を待機させる',
    async open => {
      const {
        visibleAnimation,
        handleToggle,
        updateTreeAnimationHeight,
        scrollElement,
        visibleIndices
      } = setup(open, 1000)
      visibleIndices.value = new Set([0, 1])
      handleToggle('/root')
      handleToggle('/root')
      await vi.waitFor(() => expect(visibleAnimation.value).not.toBeNull())
      const first = visibleAnimation.value
      if (!first) throw new Error('Animation did not start')

      updateTreeAnimationHeight(first.id, 20000)
      scrollElement.value.scrollTop = 18000
      scrollElement.value.dispatchEvent(new Event('scroll'))

      const scrolled = visibleAnimation.value
      expect(scrolled?.id).toBe(first.id)
      expect(scrolled?.direction).toBe(first.direction)
      expect(scrolled?.rows.some(row => row.key === '/root/child-500')).toBe(
        true
      )
      expect(scrolled?.rows.length).toBeLessThan(25)
      await Promise.resolve()
      expect(visibleAnimation.value?.id).toBe(first.id)
    }
  )

  it('新たに表示したトピックの高さを、後続行と仮想スクロールの計測値に反映する', async () => {
    const {
      visibleAnimation,
      handleToggle,
      measureTreeAnimationRows,
      resizeItem
    } = setup(false)
    handleToggle('/root')
    await vi.waitFor(() => expect(visibleAnimation.value).not.toBeNull())
    const animation = visibleAnimation.value
    if (!animation) throw new Error('Animation did not start')

    measureTreeAnimationRows(animation.id, [{ key: '/root/child', size: 72 }])

    expect(visibleAnimation.value?.id).toBe(animation.id)
    expect(visibleAnimation.value?.height).toBe(72)
    expect(resizeItem).toHaveBeenCalledWith(1, 72)
  })

  it('折りたたみで削除された子行の計測値を、同じ添字になった後続行に適用しない', async () => {
    const {
      visibleAnimation,
      handleToggle,
      measureTreeAnimationRows,
      resizeItem
    } = setup(true)
    handleToggle('/root')
    await vi.waitFor(() => expect(visibleAnimation.value).not.toBeNull())
    const animation = visibleAnimation.value
    if (!animation) throw new Error('Animation did not start')

    measureTreeAnimationRows(animation.id, [{ key: '/root/child', size: 72 }])

    expect(visibleAnimation.value?.height).toBe(72)
    expect(resizeItem).not.toHaveBeenCalled()
  })

  it.each([
    ['collapse', true],
    ['expand', false]
  ] as const)(
    '%s時にクリップ境界と後続行の位置を一致させる',
    async (direction, open) => {
      const { visibleAnimation, displayedRows, handleToggle } = setup(open)

      handleToggle('/root')
      await vi.waitFor(() => expect(visibleAnimation.value).not.toBeNull())

      const animation = visibleAnimation.value
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
      const { visibleAnimation, displayedRows, handleToggle } = setup(false)

      handleToggle('/root')
      await Promise.resolve()
      await Promise.resolve()
      expect(visibleAnimation.value).not.toBeNull()

      vi.runOnlyPendingTimers()
      expect(visibleAnimation.value).toBeNull()
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
      const { visibleAnimation, finishTreeAnimation, handleToggle } =
        setup(false)

      handleToggle('/root')
      handleToggle('/root')
      await Promise.resolve()
      await Promise.resolve()

      const firstAnimation = visibleAnimation.value
      expect(firstAnimation?.direction).toBe('expand')
      if (!firstAnimation) return

      finishTreeAnimation(firstAnimation.id)
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()

      expect(visibleAnimation.value?.direction).toBe('collapse')
    } finally {
      vi.runOnlyPendingTimers()
      vi.useRealTimers()
    }
  })
})
