<template>
  <div>
    <DMChannelElement
      v-for="dmChannel in dmChannels"
      :key="dmChannel.id"
      :class="$style.element"
      :dm-channel="dmChannel"
    />
  </div>
</template>

<script lang="ts" setup>
import type { DMChannel } from '@traptitech/traq'

import DMChannelElement from './DMChannelElement.vue'

withDefaults(
  defineProps<{
    dmChannels?: DMChannel[]
  }>(),
  {
    dmChannels: () => []
  }
)
</script>

<style lang="scss" module>
.element {
  margin: 4px 0;
}
</style>
