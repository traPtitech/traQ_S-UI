import {
  type MaybeRefOrGetter,
  computed,
  nextTick,
  shallowRef,
  toValue,
  watch
} from 'vue'

import { render, renderInline } from '/@/lib/markdown/markdown'
import type { MarkdownRenderResult } from '/@/lib/markdown/types'

export const useRenderedMarkdown = (
  source: MaybeRefOrGetter<string>,
  options: {
    inline?: MaybeRefOrGetter<boolean>
    prepareLayout?: (result: MarkdownRenderResult) => Promise<unknown>
    onRendered?: () => void
  } = {}
) => {
  const rendered = shallowRef<MarkdownRenderResult>()
  const error = shallowRef<unknown>()

  watch(
    () => [toValue(source), toValue(options.inline)] as const,
    async ([text, inline], _, onCleanup) => {
      let active = true

      onCleanup(() => {
        active = false
      })

      error.value = undefined

      try {
        const result = await (inline ? renderInline(text) : render(text))
        if (!active) return

        rendered.value = result
        await options.prepareLayout?.(result)
        await nextTick()

        if (active) options.onRendered?.()
      } catch (cause) {
        if (active) error.value = cause
      }
    },
    { immediate: true }
  )

  const renderedContent = computed(() => rendered.value?.renderedText ?? '')

  return { rendered, renderedContent, error }
}
