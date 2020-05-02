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
$headerSize: 1.25rem;

.container {
  @include color-ui-primary;
  height: 100%;
  font-size: $headerSize;
}

.channelHash {
  margin-right: 0.125rem;
  user-select: none;
}
</style>
