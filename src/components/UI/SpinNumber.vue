<template>
  <div :class="$style.body">
    <div :class="$style.dummy">
      {{ value }}
    </div>
    <transition :name="name">
      <div :key="state.val" :class="$style.number">
        {{ state.val }}
      </div>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { watch, reactive, computed } from 'vue'

const props = defineProps<{
  value: number
}>()

const state = reactive({
  val: props.value,
  reverse: false
})
watch(
  () => props.value,
  (newVal, oldVal) => {
    state.val = newVal
    state.reverse = newVal < oldVal
  }
)
const name = computed(() =>
  state.reverse ? 'vertical-swap-reverse' : 'vertical-swap'
)
</script>

<style lang="scss" module>
.body {
  position: relative;
  height: 100%;
}

.dummy {
  opacity: 0;
}

.number {
  position: absolute;
  left: 0;
  top: 0;
}
</style>
