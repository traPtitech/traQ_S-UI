<template>
  <a-stamp :stamp-id="stamp.id" :size="24" :class="$style.stampImage" />
  <span :class="$style.stampName">{{ stamp.name }}</span>
  <icon-button icon-name="plus" icon-mdi :class="$style.iconButton" />
</template>

<script lang="ts" setup>
import type { Stamp } from '@traptitech/traq'
import AStamp from '/@/components/UI/AStamp.vue'
import IconButton from '/@/components/UI/IconButton.vue'

const { stamp } = defineProps<{
  stamp: Stamp
}>()
</script>

<style lang="scss" module>
.stampImage {
  flex-shrink: 0;
}

.stampName {
  flex-grow: 1;
  margin-left: 8px;
  @include size-body2;
  word-break: break-all;
  white-space: normal;
}

.iconButton {
  @include color-ui-secondary;
}
</style>
