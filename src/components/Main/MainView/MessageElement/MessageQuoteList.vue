<template>
  <div>
    <message-quote-list-item
      v-for="id in messageIds"
      :key="id"
      :message-id="id"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from '@vue/composition-api'
import { MessageId } from '@/types/entity-ids'
import useFileMetaList from './use/fileMetaList'
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
.imageContainer {
  display: flex;
  flex-flow: row wrap;
}
.imageItem {
  flex-shrink: 0;
  margin-bottom: 16px;
  &:not(:last-child) {
    margin-right: 16px;
  }
}
.item {
  flex-shrink: 0;
  &:not(:last-child) {
    margin-bottom: 16px;
  }
}
</style>
