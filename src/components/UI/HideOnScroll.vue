<template>
  <div :class="$style.container" :data-is-collapsed="$boolAttr(!isVisible)">
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
import { ref, watch } from 'vue'

import { useEventListener } from '@vueuse/core'

const props = defineProps<{
  scrollElement: HTMLElement | null
}>()

const SCROLL_THRESHOLD_PX = 8
const isVisible = ref(true)
let scrollAnchor = 0

watch(
  () => props.scrollElement,
  scroller => {
    isVisible.value = true
    scrollAnchor = Math.max(0, scroller?.scrollTop ?? 0)
  },
  { immediate: true }
)

const onScroll = () => {
  const scroller = props.scrollElement
  if (!scroller) return

  const maxScrollTop = Math.max(
    0,
    scroller.scrollHeight - scroller.clientHeight
  )

  const scrollTop = Math.min(Math.max(0, scroller.scrollTop), maxScrollTop)
  if (scrollTop === 0) {
    isVisible.value = true
    scrollAnchor = 0
    return
  }

  // 折りたたみで表示領域が広がったときの末尾補正と上方向へのスクロールを区別
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
</script>

<style lang="scss" module>
.container {
  --hide-on-scroll-duration: 150ms;

  position: relative;
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows var(--hide-on-scroll-duration) ease-out;

  @media (prefers-reduced-motion: reduce) {
    --hide-on-scroll-duration: 0ms;
  }

  &[data-is-collapsed]:not(:has(:focus-visible)) {
    grid-template-rows: 0fr;

    .content {
      visibility: hidden;
      transition: visibility 0s var(--hide-on-scroll-duration);
    }

    .collapsedDecoration {
      visibility: visible;
      transition: none;
    }
  }
}

.content {
  min-height: 0;
  overflow: hidden;
}

.collapsedDecoration {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  visibility: hidden;
  transition: visibility 0s var(--hide-on-scroll-duration);
  pointer-events: none;
}
</style>
