<template>
  <empty-state :class="$style.container">Not Implemented</empty-state>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import EmptyState from '/@/components/UI/EmptyState.vue'

export default defineComponent({
  name: 'NotImplemented',
  components: {
    EmptyState
  },
  setup() {
    return {}
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-tertiary;
}
</style>
