<template>
  <indicator-dot
    :class="$style.container"
    :size="size"
    :border-width="borderWidth"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import IndicatorDot from './IndicatorDot.vue'

export default defineComponent({
  name: 'NotificationIndicator',
  components: {
    IndicatorDot
  },
  props: {
    size: {
      type: Number,
      default: 10
    },
    borderWidth: {
      type: Number,
      default: 0
    }
  },
  setup() {
    return {}
  }
})
</script>

<style lang="scss" module>
.container {
  background: $theme-accent-notification-background;
  border-color: $theme-background-secondary;
}
</style>
