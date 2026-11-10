import { computed, ref, watch } from 'vue'
import type { Ref } from 'vue'

import { useElementSize } from '@vueuse/core'

type ElementRef = Readonly<Ref<HTMLElement | null>>

const useCachedElementHeight = (target: ElementRef) => {
  const { height: observedHeight } = useElementSize(target, undefined, {
    box: 'border-box'
  })
  const height = ref(0)
  watch(
    [target, observedHeight],
    ([element, nextHeight]) => {
      // v-show でタブ全体が隠れた間も、仮想リストの開始位置を保持する。
      height.value = element ? nextHeight || height.value : 0
    },
    { immediate: true }
  )
  return height
}

/** 各リストの直前にある要素を表示順に指定し、累積した開始位置を返す。 */
const useScrollMargins = <T extends string>(
  sections: Record<T, ElementRef[]>
) => {
  const sectionHeights = (Object.keys(sections) as T[]).map(key => ({
    key,
    heights: sections[key].map(useCachedElementHeight)
  }))

  return computed(() => {
    const margins = {} as Record<T, number>
    let offset = 0
    for (const { key, heights } of sectionHeights) {
      offset += heights.reduce((sum, height) => sum + height.value, 0)
      margins[key] = offset
    }
    return margins
  })
}

export default useScrollMargins
