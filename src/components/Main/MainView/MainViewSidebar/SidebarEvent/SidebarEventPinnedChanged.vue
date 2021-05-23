<template>
  <sidebar-event-frame
    :title="title"
    icon-name="pin"
    icon-mdi
    :user-id="details.userId"
    :datetime="datetime"
  >
    <template v-if="message">
      <user-name :user="user" />
      <render-content :content="message?.content ?? ''" line-clamp-content />
    </template>
    <div v-else-if="message === null" :class="$style.deletedMessage">
      削除されたメッセージ
    </div>
  </sidebar-event-frame>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, watch } from 'vue'
import {
  ChannelEventTypeEnum,
  Message,
  PinAddedEvent,
  PinRemovedEvent
} from '@traptitech/traq'
import SidebarEventFrame from './SidebarEventFrame.vue'
import UserName from '@/components/UI/MessagePanel/UserName.vue'
import RenderContent from '@/components/UI/MessagePanel/RenderContent.vue'
import store from '@/store'
import { AxiosError } from 'axios'

export default defineComponent({
  name: 'SidebarEventPinnedChanged',
  components: {
    SidebarEventFrame,
    UserName,
    RenderContent
  },
  props: {
    type: {
      type: String as PropType<
        ChannelEventTypeEnum.PinAdded | ChannelEventTypeEnum.PinRemoved
      >,
      required: true
    },
    datetime: {
      type: String,
      required: true
    },
    details: {
      type: Object as PropType<PinAddedEvent | PinRemovedEvent>,
      required: true
    }
  },
  setup(props) {
    const title = computed(() =>
      props.type === ChannelEventTypeEnum.PinAdded
        ? 'ピン留め追加'
        : 'ピン留め解除'
    )

    // 削除されたメッセージは`null`
    const message = ref<Message | null>()
    watch(
      () => props.details.messageId,
      async newMessageId => {
        try {
          const m = await store.dispatch.entities.messages.fetchMessage({
            messageId: newMessageId
          })
          message.value = m
        } catch (e: unknown) {
          const err = e as AxiosError
          if (err.response?.status === 404) {
            message.value = null
          }
        }
      },
      { immediate: true }
    )

    const user = computed(() =>
      message.value
        ? store.state.entities.usersMap.get(message.value.userId)
        : undefined
    )
    return { title, message, user }
  }
})
</script>

<style lang="scss" module>
.deletedMessage {
  opacity: 0.5;
}
</style>
