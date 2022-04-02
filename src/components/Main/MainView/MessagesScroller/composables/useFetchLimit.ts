import type { Ref } from 'vue'
import { computed, watch } from 'vue'
import useBoxSize from '/@/composables/dom/useBoxSize'

const MAX_COUNT = 20

const useFetchLimit = (
  scrollerEle: Ref<{ $el: HTMLDivElement } | undefined>,
  messageHeight: number
) => {
  const { height } = useBoxSize(
    computed(() => scrollerEle.value?.$el ?? null),
    false
  )

  const fetchLimit = computed(() =>
    Math.min(Math.ceil((height.value ?? 0) / messageHeight), MAX_COUNT)
  )

  const waitHeightResolved = new Promise<void>(resolve => {
    const stop = watch(
      height,
      newHeight => {
        if (newHeight !== undefined) {
          stop()
          resolve()
        }
      },
      { immediate: true }
    )
  })

  return { fetchLimit, waitHeightResolved }
}

export default useFetchLimit
