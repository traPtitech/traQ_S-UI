<template>
  <div>
    <d-m-channel-element
      v-for="dmChannel in dmChannels"
      :key="dmChannel.id"
      :class="$style.element"
      :dm-channel="dmChannel"
    />
  </div>
</template>

<script lang="ts" setup>
import DMChannelElement from './DMChannelElement.vue'
import type { DMChannel } from '@traptitech/traq'

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
