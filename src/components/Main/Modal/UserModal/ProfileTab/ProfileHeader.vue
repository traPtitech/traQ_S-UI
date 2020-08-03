<template>
  <h2 :class="$style.header">{{ text }}</h2>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ProfileHeader',
  props: {
    text: {
      type: String,
      required: true
    }
  },
  setup() {
    return {}
  }
})
</script>

<style lang="scss" module>
.header {
  @include color-ui-secondary;
  @include size-body2;
  margin-top: 16px;
  margin-bottom: 8px;
}
</style>
