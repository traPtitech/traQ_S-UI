<template>
  <message-panel
    title-type="user"
    hide-subtitle
    line-clamp-content
    :message="message"
    @click="onMessageSelect"
  />
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api'
import { Message } from '@traptitech/traq'
import MessagePanel from '@/components/UI/MessagePanel/MessagePanel.vue'

export default defineComponent({
  name: 'ChannelSidebarPinnedListItem',
  components: { MessagePanel },
  props: {
    message: {
      type: Object as PropType<Message>,
      required: true
    }
  },
  setup(props, context) {
    const onMessageSelect = () => {
      context.root.$router.push(`/messages/${props.message.id}`)
    }

    return { onMessageSelect }
  }
})
</script>

<style lang="scss" module>
$displayNameSize: 1rem;
$textSize: 1rem;

.container {
  display: block;
  width: 256px;
  border-radius: 4px;
  word-break: break-all;
  padding: 16px;
}

.itemHeader {
  display: flex;
  padding-bottom: 4px;
  margin-bottom: 4px;
  border-bottom: solid 2px;
}

.displayName {
  font-size: $displayNameSize;
  font-weight: bold;
  margin-left: 8px;
}

.text {
  font-size: $textSize;
}
</style>
