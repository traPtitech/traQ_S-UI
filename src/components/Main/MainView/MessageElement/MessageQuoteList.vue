<template>
  <div>
    <message-quote-list-item
      v-for="id in messageIds"
      :class="$style.item"
      :key="id"
      :message-id="id"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api'
import { MessageId } from '@/types/entity-ids'
import MessageQuoteListItem from './MessageQuoteListItem.vue'

export default defineComponent({
  name: 'MessageQuoteList',
  components: {
    MessageQuoteListItem
  },
  props: {
    messageIds: {
      type: Array as PropType<MessageId[]>,
      default: []
    }
  },
  setup(props) {
    return {}
  }
})
</script>

<style lang="scss" module>
.item {
  &:not(:last-child) {
    margin-bottom: 16px;
  }
}
</style>
