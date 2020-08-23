<template>
  <div :class="$style.container">
    <span>{{ displayCurrentTime }}</span>
    <span :class="$style.slash">/</span>
    <span>{{ displayDuration }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  name: 'ChromeAudioTime',
  props: {
    displayCurrentTime: {
      type: String,
      required: true
    },
    displayDuration: {
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
.container {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
}
.slash {
  margin: 0 4px;
}
</style>
