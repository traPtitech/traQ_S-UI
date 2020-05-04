<template>
  <h2 :class="$style.container">
    <span v-if="showHash" :class="$style.channelHash">#</span>
    <span>{{ channelName }}</span>
  </h2>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  name: 'ChannelSidebarHeaderName',
  props: {
    channelName: { type: String, required: true },
    showHash: { type: Boolean, default: false }
  },
  setup() {
    return {}
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  @include size-h2;
  height: 100%;
}

.channelHash {
  margin-right: 0.125rem;
  user-select: none;
}
</style>
