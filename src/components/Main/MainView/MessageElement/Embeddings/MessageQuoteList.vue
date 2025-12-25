<template>
  <div>
    <MessageQuoteListItem
      v-for="id in messageIds"
      :key="id"
      :class="$style.item"
      :parent-message-channel-id="parentMessageChannelId"
      :message-id="id"
      :disable-footer-links="disableItemFooterLinks"
    />
  </div>
</template>

<script lang="ts" setup>
import type { ChannelId, DMChannelId, MessageId } from '/@/types/entity-ids'

import MessageQuoteListItem from './MessageQuoteListItem.vue'

withDefaults(
  defineProps<{
    parentMessageChannelId: ChannelId | DMChannelId
    messageIds?: MessageId[]
    disableItemFooterLinks?: boolean
  }>(),
  {
    messageIds: () => [],
    disableItemFooterLinks: false
  }
)
</script>

<style lang="scss" module>
.item {
  &:not(:last-child) {
    margin-bottom: 16px;
  }
}
</style>
