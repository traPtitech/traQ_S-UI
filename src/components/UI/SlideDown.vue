<template>
  <transition
    name="slide-vertical"
    @enter="setScrollHeight($event as HTMLElement)"
    @leave="unsetHeight($event as HTMLElement)"
    @after-enter="unsetHeight($event as HTMLElement)"
    @before-leave="setCurrentHeight($event as HTMLElement)"
  >
    <div v-if="isOpen" :class="$style.wrapper">
      <slot />
    </div>
  </transition>
</template>

<script lang="ts" setup>
import { defer } from '/@/lib/basic/timer'

defineProps<{
  isOpen: boolean
}>()

const setScrollHeight = async ($el: HTMLElement) => {
  // scrollHeight が 0 にならないようにフレームをずらす
  await defer()
  setCurrentHeight($el)
}

const setCurrentHeight = ($el: HTMLElement) => {
  $el.style.height = `${$el.scrollHeight}px`
}
const unsetHeight = async ($el: HTMLElement) => {
  // 処理がまとめられて height のセットがされない場合があるので，フレームをずらす
  await defer()
  $el.style.height = null as unknown as string
}
</script>

<style lang="scss" module>
.wrapper {
  overflow: hidden;
}
</style>
