import { computed, nextTick, shallowRef } from 'vue'
import type { ComputedRef, Ref } from 'vue'

import type { Virtualizer } from '@tanstack/vue-virtual'

import {
  CHANNEL_TREE_ANIMATION_DURATION_MS,
  type ChannelTreeAnimationState,
  type VirtualChannelRow,
  createChannelTreeAnimation
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
  scrollMargin,
  toggle
}: ChannelTreeAnimationOptions<TScrollElement, TItemElement>) => {
  const virtualItemRows = computed((): VirtualChannelRow[] =>
    virtualizer.value.getVirtualItems().flatMap(vItem => {
      const item = flatItems.value[vItem.index]
      return item !== undefined ? [{ vItem, item, key: String(vItem.key) }] : []
    })
  )

  const treeAnimation = shallowRef<ChannelTreeAnimationState | null>(null)
  let treeAnimationId = 0
  let resolveTreeAnimation: (() => void) | undefined

  const displayedRows = computed(() => {
    const animation = treeAnimation.value
    if (!animation) return virtualItemRows.value

    return virtualItemRows.value.filter(
      ({ key }) =>
        !animation.rowKeys.has(key) && !animation.movingRowKeys.has(key)
    )
  })

  const finishTreeAnimation = (animationId: number) => {
    if (treeAnimation.value?.id === animationId) {
      treeAnimation.value = null
      resolveTreeAnimation?.()
      resolveTreeAnimation = undefined
    }
  }

  const toggleWithAnimation = async (itemKey: string) => {
    const prePositions = new Map(
      virtualizer.value
        .getVirtualItems()
        .map(item => [String(item.key), item.start])
    )
    const preRows = virtualItemRows.value
    const preExpandedNodeKeys = new Set(expandedNodeKeys.value)
    const preKeys = new Set(flatItems.value.map(item => item.key))
    const preTotalSize = virtualizer.value.getTotalSize()
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

    const postRows = virtualItemRows.value
    const postTotalSize = virtualizer.value.getTotalSize()
    const totalSizeDelta = postTotalSize - preTotalSize

    if (totalSizeDelta === 0) {
      treeAnimation.value = null
      return
    }

    const animationId = ++treeAnimationId
    treeAnimation.value = createChannelTreeAnimation({
      id: animationId,
      direction,
      origin,
      scrollMargin: scrollMargin.value,
      preRows,
      postRows,
      prePositions,
      preKeys,
      preExpandedNodeKeys,
      expandedNodeKeys: expandedNodeKeys.value,
      postFlatItems: flatItems.value,
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
    handleToggle
  }
}

export default useChannelTreeAnimation
