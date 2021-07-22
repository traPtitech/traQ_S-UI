<template>
  <div :class="$style.container">
    <span :class="$style.hr"></span>
    <span v-if="label !== ''" :class="$style.label">
      {{ label }}
    </span>
    <span :class="$style.hr"></span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import {} from '/@/lib/styles'

export default defineComponent({
  name: 'AuthenticateSeparator',
  props: {
    label: {
      type: String,
      default: ''
    }
  },
  setup() {
    return {}
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
}
.hr {
  @include background-tertiary;
  width: 100%;
  height: 2px;
}
.label {
  @include color-ui-secondary;
  margin: 0 16px;
  flex-shrink: 0;
  font-weight: bold;
}
</style>
