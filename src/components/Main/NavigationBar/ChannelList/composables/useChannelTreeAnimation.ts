import { computed, nextTick, ref, shallowRef, watch } from 'vue'
import type { ComputedRef, Ref } from 'vue'

import type { Virtualizer } from '@tanstack/vue-virtual'
import { useEventListener } from '@vueuse/core'

import {
  CHANNEL_TREE_ANIMATION_DURATION_MS,
  type ChannelTreeAnimationSnapshot,
  type VirtualChannelRow,
  createChannelTreeAnimation,
  getVisibleChannelTreeAnimation
} from '../channelTreeAnimation'
import type { FlatChannelItem } from './useChannelFlatList'

const TREE_ANIMATION_FALLBACK_MS = CHANNEL_TREE_ANIMATION_DURATION_MS + 50

interface ChannelTreeAnimationOptions<
  TScrollElement extends Element,
  TItemElement extends Element
> {
  virtualizer: Ref<Virtualizer<TScrollElement, TItemElement>>
  flatItems: ComputedRef<FlatChannelItem[]>
  expandedNodeKeys: Ref<Set<string>>
  scrollElement: Readonly<Ref<TScrollElement | null>>
  scrollMargin: ComputedRef<number>
  toggle: (itemKey: string) => void
}

const useChannelTreeAnimation = <
  TScrollElement extends Element,
  TItemElement extends Element
>({
  virtualizer,
  flatItems,
  expandedNodeKeys,
  scrollElement,
  scrollMargin,
  toggle
}: ChannelTreeAnimationOptions<TScrollElement, TItemElement>) => {
  const virtualItemRows = computed((): VirtualChannelRow[] =>
    virtualizer.value.getVirtualItems().flatMap(vItem => {
      const item = flatItems.value[vItem.index]
      return item !== undefined ? [{ vItem, item, key: String(vItem.key) }] : []
    })
  )

  const animationSnapshot = shallowRef<ChannelTreeAnimationSnapshot | null>(
    null
  )
  const currentHeight = ref(0)
  const scrollOffset = ref(0)

  const updateScrollOffset = () => {
    scrollOffset.value = scrollElement.value?.scrollTop ?? 0
  }

  watch(scrollElement, updateScrollOffset, { immediate: true })
  useEventListener(scrollElement, 'scroll', updateScrollOffset, {
    passive: true
  })

  const treeAnimation = computed(() => {
    const animation = animationSnapshot.value
    if (!animation) return null

    const viewportStart = scrollOffset.value - scrollMargin.value
    const viewportHeight =
      virtualizer.value.scrollRect?.height ??
      scrollElement.value?.clientHeight ??
      0
    return getVisibleChannelTreeAnimation(
      animation,
      viewportStart,
      viewportStart + viewportHeight,
      currentHeight.value,
      virtualizer.value.options.overscan
    )
  })

  let treeAnimationId = 0
  let resolveTreeAnimation: (() => void) | undefined

  const displayedRows = computed(() => {
    const animation = animationSnapshot.value
    if (!animation) return virtualItemRows.value

    return virtualItemRows.value.filter(
      ({ vItem }) => vItem.start - scrollMargin.value < animation.origin
    )
  })

  const finishTreeAnimation = (animationId: number) => {
    if (animationSnapshot.value?.id === animationId) {
      animationSnapshot.value = null
      resolveTreeAnimation?.()
      resolveTreeAnimation = undefined
    }
  }

  const updateTreeAnimationHeight = (animationId: number, height: number) => {
    if (animationSnapshot.value?.id === animationId)
      currentHeight.value = height
  }

  const snapshotRows = (): VirtualChannelRow[] =>
    // 計測キャッシュは遅延生成される疎な配列なので、未描画の行も読み出す。
    Array.from(virtualizer.value.measurementsCache).flatMap(vItem => {
      const item = flatItems.value[vItem.index]
      return item ? [{ vItem: { ...vItem }, item, key: String(vItem.key) }] : []
    })

  const toggleWithAnimation = async (itemKey: string) => {
    const retainedKeys = new Set(virtualItemRows.value.map(row => row.key))
    const preExpandedNodeKeys = new Set(expandedNodeKeys.value)
    const preTotalSize = virtualizer.value.getTotalSize()
    const preRows = snapshotRows()
    const parent = virtualizer.value
      .getVirtualItems()
      .find(item => String(item.key) === itemKey)

    if (!parent) {
      toggle(itemKey)
      return
    }

    const direction = expandedNodeKeys.value.has(itemKey)
      ? 'collapse'
      : 'expand'
    const descendantKeyPrefix = `${itemKey}/`
    const origin = parent.end - scrollMargin.value

    toggle(itemKey)
    await nextTick()

    const postTotalSize = virtualizer.value.getTotalSize()
    const postRows = snapshotRows()
    for (const row of virtualItemRows.value) retainedKeys.add(row.key)
    const totalSizeDelta = postTotalSize - preTotalSize

    if (totalSizeDelta === 0) {
      animationSnapshot.value = null
      return
    }

    const animationId = ++treeAnimationId
    currentHeight.value = direction === 'expand' ? 0 : Math.abs(totalSizeDelta)
    animationSnapshot.value = createChannelTreeAnimation({
      id: animationId,
      direction,
      origin,
      scrollMargin: scrollMargin.value,
      preRows,
      postRows,
      retainedKeys,
      preExpandedNodeKeys,
      expandedNodeKeys: expandedNodeKeys.value,
      postTotalSize,
      totalSizeDelta,
      descendantKeyPrefix
    })
    await new Promise<void>(resolve => {
      resolveTreeAnimation = resolve
      setTimeout(
        () => finishTreeAnimation(animationId),
        TREE_ANIMATION_FALLBACK_MS
      )
    })
  }

  let toggleQueue = Promise.resolve()
  const handleToggle = (itemKey: string) => {
    toggleQueue = toggleQueue.then(() => toggleWithAnimation(itemKey))
  }

  return {
    displayedRows,
    treeAnimation,
    finishTreeAnimation,
    updateTreeAnimationHeight,
    handleToggle
  }
}

export default useChannelTreeAnimation
