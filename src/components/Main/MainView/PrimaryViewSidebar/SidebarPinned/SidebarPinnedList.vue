<template>
  <div>
    <sidebar-pinned-message
      v-for="message in sortedMessages"
      :key="message.id"
      :message="message"
      :class="$style.item"
    />
    <div v-if="sortedMessages.length <= 0" :class="$style.noPinned">
      ピン留めされたメッセージはありません
    </div>
  </div>
</template>

<script lang="ts" setup>
import SidebarPinnedMessage from './SidebarPinnedMessage.vue'
import { computed } from 'vue'
import type { Pin } from '@traptitech/traq'

const props = withDefaults(
  defineProps<{
    pinnedMessages?: Pin[]
  }>(),
  {
    pinnedMessages: () => []
  }
)

const sortedMessages = computed(() =>
  [...props.pinnedMessages]
    .sort((a, b) => Date.parse(b.pinnedAt) - Date.parse(a.pinnedAt))
    .map(pinnedMessage => pinnedMessage.message)
)
</script>

<style lang="scss" module>
.item + .item {
  margin-top: 16px;
}

.noPinned {
  @include color-ui-secondary;
  @include background-secondary;
  padding: 8px;
  border-radius: 4px;
}
</style>
