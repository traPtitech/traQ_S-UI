<script setup lang="ts">
import { useTemplateRef } from 'vue'
import InlineMarkdown from '/@/components/UI/InlineMarkdown.vue'

const { markdown } = defineProps<{
  markdown: string
}>()

const danmakuRef = useTemplateRef<HTMLDivElement>('danmakuRef')

const startAnimation = () => {
  const danmaku = danmakuRef.value
  if (danmaku) {
    const top =
      Math.random() *
      ((danmaku.parentElement?.offsetHeight ?? 0) - danmaku.offsetHeight)
    danmaku.style.top = `${top}px`
    danmaku.animate(
      [
        {
          transform: 'translateX(0)'
        },
        {
          transform: `translateX(${-(danmaku.parentElement?.offsetWidth ?? 0) - 1 * danmaku.offsetWidth}px)`
        }
      ],
      {
        duration: 5000,
        easing: 'linear',
        iterations: 1
      }
    )
  }
}
</script>

<template>
  <div ref="danmakuRef" :class="$style.danmaku">
    <InlineMarkdown :content="markdown" @render="startAnimation" />
  </div>
</template>

<style lang="scss" module>
.danmaku {
  position: absolute;
  white-space: nowrap;
  animation-name: flow;
  animation-timing-function: linear;
  animation-iteration-count: 1;
  left: 100%;
  font-size: 32px;
  color: black;
  text-shadow: 1px 1px 2px white;
  z-index: 301;
}
</style>
