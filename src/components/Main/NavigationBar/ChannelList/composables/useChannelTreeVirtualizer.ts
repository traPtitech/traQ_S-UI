import { computed, ref, watch } from 'vue'
import type { ComputedRef, Ref } from 'vue'

import { useVirtualizer } from '@tanstack/vue-virtual'
import { useRafFn } from '@vueuse/core'

import { useNavigationVisibility } from '../../composables/useNavigationVisibility'
import { createScrollCorrectionHandlers } from '../virtualizerScrollCorrection'
import type { FlatChannelItem } from './useChannelFlatList'
import useTouchScrollInteraction from './useTouchScrollInteraction'

const TOUCH_SCROLL_SETTLE_DELAY_MS = 150

interface ChannelTreeVirtualizerOptions {
  flatItems: ComputedRef<FlatChannelItem[]>
  scrollElement: Readonly<Ref<HTMLElement | null>>
  scrollMargin: ComputedRef<number>
}

const useChannelTreeVirtualizer = ({
  flatItems,
  scrollElement,
  scrollMargin
}: ChannelTreeVirtualizerOptions) => {
  const scrollCorrectionHandlers = createScrollCorrectionHandlers()
  const touchInteraction = useTouchScrollInteraction(
    scrollElement,
    TOUCH_SCROLL_SETTLE_DELAY_MS
  )

  const isVisible = useNavigationVisibility()
  const useCachedMeasurements = ref(!isVisible.value)
  const { pause, resume } = useRafFn(
    () => {
      useCachedMeasurements.value = !isVisible.value
    },
    { immediate: false, once: true }
  )

  watch(isVisible, visible => {
    pause()
    useCachedMeasurements.value = true

    if (visible) resume()
  })

  const virtualizer = useVirtualizer<HTMLElement, HTMLElement>(
    computed(() => ({
      count: flatItems.value.length,
      getScrollElement: () => scrollElement.value,
      initialOffset: () => scrollElement.value?.scrollTop ?? 0,
      estimateSize: () => 36,
      useCachedMeasurements: useCachedMeasurements.value,
      useAnimationFrameWithResizeObserver: true,
      overscan: 5,
      getItemKey: (index: number) => flatItems.value[index]?.key ?? index,
      scrollMargin: scrollMargin.value,
      ...scrollCorrectionHandlers
    }))
  )

  touchInteraction.observe()

  virtualizer.value.shouldAdjustScrollPositionOnItemSizeChange = (
    item,
    _delta,
    instance
  ) =>
    !instance.isScrolling &&
    !touchInteraction.isActive() &&
    item.start < (instance.scrollOffset ?? 0)

  return virtualizer
}

export default useChannelTreeVirtualizer
