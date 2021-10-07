<template>
  <div :class="$style.container">
    <router-link
      v-for="message in sortedMessages"
      :key="message.id"
      :to="`/messages/${message.id}`"
    >
      <message-panel
        title-type="user"
        hide-subtitle
        line-clamp-content
        :message="message"
        :class="$style.item"
      />
    </router-link>
    <div v-if="sortedMessages.length <= 0" :class="$style.noPinned">
      ピン留めされたメッセージはありません
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import { Pin } from '@traptitech/traq'
import MessagePanel from '/@/components/UI/MessagePanel/MessagePanel.vue'

export default defineComponent({
  name: 'ChannelSidebarPinnedList',
  components: { MessagePanel },
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
    return { sortedMessages }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
  @include background-secondary;
}

.item {
  margin-top: 16px;
}

.noPinned {
  @include color-ui-tertiary;
}
</style>
