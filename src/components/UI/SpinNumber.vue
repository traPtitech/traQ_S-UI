<template>
  <div :class="$style.body">
    <div :class="$style.dummy">{{ props.value }}</div>
    <transition name="vertical-swap">
      <div :class="$style.number" v-if="state.isB" key="num1">
        {{ state.valueB }}
      </div>
      <div :class="$style.number" v-else key="num2">
        {{ state.valueA }}
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  watch,
  reactive,
  PropType
} from '@vue/composition-api'

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
      valueA: props.value,
      valueB: 0,
      isB: false
    })
    watch(
      () => props.value,
      (newVal, oldVal) => {
        if (state.isB) {
          state.valueA = newVal
        } else {
          state.valueB = newVal
        }
        state.isB = !state.isB
      },
      { lazy: true }
    )
    return {
      props,
      state
    }
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
