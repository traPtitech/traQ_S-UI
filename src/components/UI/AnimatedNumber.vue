<template>
  <div>
    <span>{{ state.currentValue }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, watch, reactive } from '@vue/composition-api'

type Props = {
  value: number
}

export default defineComponent({
  name: 'AnimatedNumber',
  props: {
    value: {
      type: Number,
      required: true
    }
  },
  setup(props: Props) {
    const state = reactive({
      currentValue: props.value,
      changedValue: 0
    })
    watch(
      () => props.value,
      (oldVal, newVal) => console.log(oldVal, newVal),
      { lazy: true }
    )
    return {
      props,
      state
    }
  }
})
</script>

<style lang="scss" module></style>
