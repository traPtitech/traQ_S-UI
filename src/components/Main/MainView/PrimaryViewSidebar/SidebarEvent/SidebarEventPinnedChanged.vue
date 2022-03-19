<template>
  <sidebar-event-frame
    :title="title"
    icon-name="pin"
    icon-mdi
    :user-id="details.userId"
    :datetime="datetime"
    :link="messageLink"
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

<script lang="ts" setup>
import SidebarEventFrame from './SidebarEventFrame.vue'
import UserName from '/@/components/UI/MessagePanel/UserName.vue'
import RenderContent from '/@/components/UI/MessagePanel/RenderContent.vue'
import { computed, ref, watch } from 'vue'
import {
  ChannelEventTypeEnum,
  Message,
  PinAddedEvent,
  PinRemovedEvent
} from '@traptitech/traq'
import { AxiosError } from 'axios'
import { constructMessagesPath } from '/@/router'
import { useMessagesStore } from '/@/store/entities/messages'
import { useUsersStore } from '/@/store/entities/users'

const props = defineProps<{
  type:
    | typeof ChannelEventTypeEnum.PinAdded
    | typeof ChannelEventTypeEnum.PinRemoved
  datetime: string
  details: PinAddedEvent | PinRemovedEvent
}>()

const { fetchMessage } = useMessagesStore()
const { usersMap } = useUsersStore()

const title = computed(() =>
  props.type === ChannelEventTypeEnum.PinAdded ? 'ピン留め追加' : 'ピン留め解除'
)

// 削除されたメッセージは`null`
const message = ref<Message | null>()
watch(
  () => props.details.messageId,
  async newMessageId => {
    try {
      const m = await fetchMessage({
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
  message.value ? usersMap.value.get(message.value.userId) : undefined
)

const messageLink = computed(() =>
  message.value ? constructMessagesPath(message.value.id) : undefined
)
</script>

<style lang="scss" module>
.deletedMessage {
  @include color-ui-primary-inactive;
}
</style>
