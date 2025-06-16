<script setup lang="ts">
import { onMounted, useTemplateRef } from 'vue'
import AStamp from '/@/components/UI/AStamp.vue'

const { stampId } = defineProps<{
  stampId: string
}>()

const danmakuRef = useTemplateRef<HTMLDivElement>('danmakuRef')

const startAnimation = () => {
  const danmaku = danmakuRef.value
  if (danmaku) {
    const top =
      96 + Math.random() * ((danmaku.parentElement?.offsetHeight ?? 0) - 144)
    const left =
      Math.random() * ((danmaku.parentElement?.offsetWidth ?? 0) - 48)
    danmaku.style.top = `${top}px`
    danmaku.style.left = `${left}px`
    danmaku.animate(
      [
        {
          transform: `scale(1)`,
          opacity: 0.0
        },
        {
          transform: `scale(2) translateY(-4rem)`,
          opacity: 1
        }
      ],
      {
        duration: 1500,
        easing: 'ease-in',
        iterations: 1
      }
    )
  }
}

onMounted(() => startAnimation())
</script>

<template>
  <div ref="danmakuRef" :class="$style.danmaku">
    <AStamp :stamp-id="stampId" :size="48" />
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
  z-index: 300;
}
</style>
