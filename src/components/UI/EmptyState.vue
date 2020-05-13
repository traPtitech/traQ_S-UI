<template>
  <div :class="$style.container">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  name: 'EmptyState',
  setup() {
    return {}
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-tertiary;
  display: flex;
  justify-content: center;
  width: 100%;
  padding-top: 2rem;
  padding-bottom: 2rem;
}
</style>
