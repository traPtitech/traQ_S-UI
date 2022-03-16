<template>
  <div>
    <message-quote-list-item
      v-for="id in messageIds"
      :key="id"
      :class="$style.item"
      :parent-message-channel-id="parentMessageChannelId"
      :message-id="id"
    />
  </div>
</template>

<script lang="ts" setup>
import MessageQuoteListItem from './MessageQuoteListItem.vue';
import { MessageId, ChannelId, DMChannelId } from '/@/types/entity-ids'

withDefaults(defineProps<{
    parentMessageChannelId: ChannelId | DMChannelId,
    messageIds?: MessageId[]
}>(), {
    messageIds: () => []
})


</script>

<style lang="scss" module>
.item {
  &:not(:last-child) {
    margin-bottom: 16px;
  }
}
</style>
