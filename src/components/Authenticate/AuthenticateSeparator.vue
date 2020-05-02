<template>
  <div :class="$style.container">
    <span :class="$style.hr"></span>
    <span :class="$style.label">
      {{ label }}
    </span>
    <span :class="$style.hr"></span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import {} from '@/lib/styles'

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
  width: 100%;
  height: 2px;
  background: $theme-ui-tertiary;
}
.label {
  margin: 0 16px;
  flex-shrink: 0;
  font-weight: bold;
  color: $theme-ui-secondary;
}
</style>
