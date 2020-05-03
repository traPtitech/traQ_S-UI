<template>
  <!-- TODO: 折り畳み -->
  <div>
    <div :class="$style.subtitleContainer">
      <h3
        v-if="subtitle && subtitle.length > 0"
        :class="$style.subtitle"
        :style="subtitleStyle"
      >
        {{ subtitle }}
      </h3>
      <div :class="$style.control">
        <slot name="control"></slot>
      </div>
    </div>
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
.subtitleContainer {
  display: flex;
  justify-content: space-between;
}
.subtitle {
  @include font-size-slightly-small;
  margin-bottom: 8px;
  font-weight: bold;
}
.control {
  flex-shrink: 0;
}
</style>
