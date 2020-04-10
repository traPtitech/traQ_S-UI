<template>
  <!-- TODO: 折り畳み -->
  <div>
    <h3
      v-if="subtitle && subtitle.length > 0"
      :class="$style.subtitle"
      :style="subtitleStyle"
    >
      {{ subtitle }}
    </h3>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'

export default defineComponent({
  name: 'NavigationContentContainer',
  props: {
    subtitle: String
  },
  setup() {
    const subtitleStyle = makeStyles(theme => ({
      color: theme.ui.secondary
    }))
    return {
      subtitleStyle
    }
  }
})
</script>

<style lang="scss" module>
.subtitle {
  font-size: 0.875rem;
  margin-bottom: 8px;
  font-weight: bold;
}
</style>
