<template>
  <div
    ref="element"
    :class="$style.container"
    :data-is-collapsed="$boolAttr(!isVisible)"
  >
    <div :class="$style.content">
      <slot />
    </div>
    <div
      v-if="$slots['collapsed-decoration']"
      :class="$style.collapsedDecoration"
      aria-hidden="true"
    >
      <slot name="collapsed-decoration" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, useTemplateRef, watch } from 'vue'

import { useEventListener } from '@vueuse/core'

const props = defineProps<{
  scrollElement: HTMLElement | null
}>()

const element = useTemplateRef<HTMLElement>('element')

const SCROLL_THRESHOLD_PX = 32
const isVisible = ref(true)
let scrollAnchor = 0

const reveal = () => {
  isVisible.value = true
  scrollAnchor = Math.max(0, props.scrollElement?.scrollTop ?? 0)
}

watch(() => props.scrollElement, reveal, { immediate: true })

const onScroll = () => {
  const scroller = props.scrollElement
  if (!scroller) return

  const maxScrollTop = Math.max(
    0,
    scroller.scrollHeight - scroller.clientHeight
  )

  const scrollTop = Math.min(Math.max(0, scroller.scrollTop), maxScrollTop)
  if (scrollTop === 0) {
    reveal()
    return
  }

  const anchor = Math.min(scrollAnchor, maxScrollTop)
  scrollAnchor = isVisible.value
    ? Math.min(anchor, scrollTop)
    : Math.max(anchor, scrollTop)

  if (Math.abs(scrollTop - scrollAnchor) >= SCROLL_THRESHOLD_PX) {
    isVisible.value = !isVisible.value
    scrollAnchor = scrollTop
  }
}

useEventListener(() => props.scrollElement, 'scroll', onScroll, {
  passive: true
})

defineExpose({ element, reveal })
</script>

<style lang="scss" module>
.container {
  --hide-on-scroll-duration: 180ms;

  position: sticky;
  top: 0;
  z-index: 1;
  overflow-anchor: none;
  pointer-events: none;

  @media (prefers-reduced-motion: reduce) {
    --hide-on-scroll-duration: 0ms;
  }

  &[data-is-collapsed]:not(:has(:focus-visible)) {
    .content {
      clip-path: inset(0 0 100%);
      visibility: hidden;
      transition:
        clip-path var(--hide-on-scroll-duration) ease-out,
        visibility 0s var(--hide-on-scroll-duration);
    }

    .collapsedDecoration {
      top: 0;
      visibility: visible;
      transition: top var(--hide-on-scroll-duration) ease-out;
    }
  }
}

.content {
  display: flow-root;
  background: var(--hide-on-scroll-background, transparent);
  clip-path: inset(0);
  pointer-events: auto;
  transition: clip-path var(--hide-on-scroll-duration) ease-out;
}

.collapsedDecoration {
  position: absolute;
  inset-inline: 0;
  top: 100%;
  visibility: hidden;
  transition:
    top var(--hide-on-scroll-duration) ease-out,
    visibility 0s var(--hide-on-scroll-duration);
}
</style>
