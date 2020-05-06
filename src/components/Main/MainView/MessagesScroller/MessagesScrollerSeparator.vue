<template>
  <div :class="$style.container" v-if="!noSeparator">
    <div :class="$style.title">
      {{ title }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  name: 'MessagesScrollerSeparator',
  props: {
    title: { type: String, required: true },
    noSeparator: { type: Boolean, default: false }
  },
  setup() {
    return {}
  }
})
</script>

<style lang="scss" module>
.container {
  width: 100%;
  height: 32px;
  padding: 4px 12px;
  contain: strict;
}
.title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  &::before,
  &::after {
    display: block;
    background-color: currentColor;
    height: 1px;
    width: calc(50% - 70px);
    content: '';
    opacity: 0.1;
  }
}
</style>
