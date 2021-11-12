<template>
  <div :class="$style.container">
    <div :class="$style.header">
      <user-name :class="$style.item" :user="userState" is-title />
      <a-icon
        :class="$style.icon"
        :size="28"
        mdi
        name="dots-horizontal"
        @click.prevent="toggleContextMenu"
      />
    </div>
    <div :class="$style.separator" />
    <render-content
      :content="message.content"
      :line-clamp-content="lineClampContent"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import { ActivityTimelineMessage, Message } from '@traptitech/traq'
import UserName from '/@/components/UI/MessagePanel/UserName.vue'
import RenderContent from '/@/components/UI/MessagePanel/RenderContent.vue'
import AIcon from '/@/components/UI/AIcon.vue'
import store from '/@/store'
import { useMessageContextMenuInvoker } from '../providers/messageContextMenu'

export default defineComponent({
  name: 'SidebarPinned',
  components: {
    UserName,
    RenderContent,
    AIcon
  },
  props: {
    message: {
      type: Object as PropType<Message | ActivityTimelineMessage>,
      required: true
    },
    lineClampContent: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const userState = computed(() =>
      store.state.entities.usersMap.get(props.message.userId)
    )
    if (userState.value === undefined) {
      store.dispatch.entities.fetchUser({ userId: props.message.userId })
    }

    const isArchived = computed(
      () =>
        store.state.entities.channelsMap.get(props.message.channelId)
          ?.archived ?? false
    )

    const { toggleContextMenu } = useMessageContextMenuInvoker({
      messageId: props.message.id,
      isMinimum: isArchived.value
    })

    return { userState, toggleContextMenu }
  }
})
</script>

<style lang="scss" module>
.container {
  @include background-primary;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
}
.header {
  display: flex;
}
.separator {
  @include background-secondary;
  width: 100%;
  height: 2px;
  margin: 4px 0;
}
.item {
  margin: 4px 0;
}
.icon {
  display: block;
  padding: 4px;
  cursor: pointer;
  margin: 0 0 0 auto;
  &:hover {
    @include background-secondary;
  }
}
</style>
