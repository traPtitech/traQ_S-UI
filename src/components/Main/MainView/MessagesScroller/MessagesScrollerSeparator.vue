<template>
  <div :class="$style.container">
    <div :class="$style.title">
      {{ title }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'MessagesScrollerSeparator',
  props: {
    title: { type: String, required: true }
  },
  setup() {
    return {}
  }
})
</script>

<style lang="scss" module>
$margin: 30px;

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
    flex: 1 1;
    height: 2px;
    content: '';
    opacity: 0.1;
  }
  &::before {
    margin-right: $margin;
  }
  &::after {
    margin-left: $margin;
  }
}
</style>
