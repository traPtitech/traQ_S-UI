<template>
  <div :class="$style.body">
    <div :class="$style.dummy">{{ value }}</div>
    <transition :name="name">
      <div :class="$style.number" :key="state.val">
        {{ state.val }}
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, watch, reactive, PropType, computed } from 'vue'

export default defineComponent({
  name: 'SpinNumber',
  props: {
    value: {
      type: Number as PropType<number>,
      required: true
    }
  },
  setup(props) {
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
    return { state, name }
  }
})
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
