<template>
  <div :class="$style.container">
    <message-panel
      v-for="message in pinnedMessage"
      :key="message.message.id"
      title-type="user"
      hide-subtitle
      line-clamp-content
      :message="message.message"
      @click="onMessageSelect(message.message.id)"
      :class="$style.sidebarItem"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api'
import { Pin } from '@traptitech/traq'
import MessagePanel from '@/components/UI/MessagePanel/MessagePanel.vue'
import { MessageId } from '@/types/entity-ids'

export default defineComponent({
  name: 'ChannelSidebarPinnedList',
  components: { MessagePanel },
  props: {
    pinnedMessage: { type: Array as PropType<Pin[]>, default: [] }
  },
  setup(props, context) {
    const closeBar = () => {
      context.emit('closeBar')
    }

    const onMessageSelect = (messageId: MessageId) => {
      context.root.$router.push(`/messages/${messageId}`)
    }

    return { closeBar, onMessageSelect }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
  @include background-secondary;
}

.sidebarItem {
  margin-top: 16px;
}
</style>
