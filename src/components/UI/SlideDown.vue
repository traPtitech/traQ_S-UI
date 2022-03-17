<template>
  <transition
    name="slide-vertical"
    @enter="setScrollHeight"
    @after-enter="unsetHeight"
    @before-leave="setCurrentHeight"
    @leave="unsetHeight"
  >
    <div v-if="isOpen" :class="$style.wrapper">
      <slot />
    </div>
  </transition>
</template>

<script lang="ts" setup>
import { rAF } from '/@/lib/basic/timer'

defineProps<{
  isOpen: boolean
}>()

const setScrollHeight = async ($el: Element) => {
  // フレームずらさないとscrollHeightが0になるため
  await rAF()
  await rAF()
  setCurrentHeight($el)
}
const setCurrentHeight = ($el: Element) => {
  ;($el as HTMLElement).style.height = `${$el.scrollHeight}px`
}
const unsetHeight = async ($el: Element) => {
  // フレームずらさないと処理がまとめられてheightのセットがされないことにされるため
  await rAF()
  await rAF()
  ;($el as HTMLElement).style.height = null as unknown as string
}
</script>

<style lang="scss" module>
.wrapper {
  overflow: hidden;
}
</style>
