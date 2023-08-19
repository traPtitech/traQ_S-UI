<template>
  <div :class="$style.container">
    <div :class="$style.innerContainer">
      {{ shownMessageDate }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { ChannelId } from '/@/types/entity-ids'

defineProps<{
  channelId: ChannelId
  shownMessageDate: string
}>()
</script>

<style lang="scss" module>
.container {
  position: absolute;
  inset: 12px 0 auto;
  margin: 0 auto;
  width: 140px;
  z-index: $z-index-shown-message-date;
}
.innerContainer {
  background-color: white;
  border-radius: 24px;
  padding: 4px 16px;
  text-align: center;
  font-weight: bold;
  border: 1px solid $theme-ui-tertiary-default;
}
</style>
