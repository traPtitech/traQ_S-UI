<template>
  <div :class="$style.container">
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

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import { Pin } from '@traptitech/traq'
import SidebarPinnedMessage from './SidebarPinnedMessage.vue'
import { constructMessagesPath } from '/@/router'

export default defineComponent({
  name: 'SidebarPinnedList',
  components: {
    SidebarPinnedMessage
  },
  props: {
    pinnedMessages: {
      type: Array as PropType<Pin[]>,
      default: () => []
    }
  },
  setup(props) {
    const sortedMessages = computed(() =>
      [...props.pinnedMessages]
        .sort((a, b) => Date.parse(b.pinnedAt) - Date.parse(a.pinnedAt))
        .map(pinnedMessage => pinnedMessage.message)
    )

    return {
      sortedMessages,
      constructMessagesPath
    }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
  @include background-secondary;
}
.item + .item {
  margin-top: 16px;
}

.noPinned {
  @include color-ui-tertiary;
}
</style>
