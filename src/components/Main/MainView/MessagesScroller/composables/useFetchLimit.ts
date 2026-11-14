import type { ShallowRef } from 'vue'
import { nextTick, watch } from 'vue'

export type MessageScrollerRef = ShallowRef<{ $el: HTMLDivElement } | undefined>

const MAX_COUNT = 20

const useFetchLimit = (
  scrollerRef: MessageScrollerRef,
  messageHeight: number
) => {
  const scrollerMounted = new Promise<void>(resolve => {
    const stop = watch(scrollerRef, scroller => {
      if (!scroller) return

      stop()
      resolve()
    })
  })

  return async () => {
    await scrollerMounted
    // 遷移先の入力欄が反映されてから一覧の高さを測る
    await nextTick()

    const height = scrollerRef.value?.$el.clientHeight
    return height
      ? Math.min(Math.ceil(height / messageHeight), MAX_COUNT)
      : MAX_COUNT
  }
}

export default useFetchLimit
