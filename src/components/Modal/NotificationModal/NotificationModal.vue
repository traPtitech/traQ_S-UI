<template>
  <modal-frame
    title="通知設定"
    :subtitle="`#${currentChannelPathString}`"
    icon-name="notified-or-subscribed"
  >
    <modal-section title="自分の通知設定">
      <notification-state-selector />
    </modal-section>
    <modal-section
      title="他ユーザーの通知設定"
      description="このチャンネルのメッセージの通知がユーザーに送られるか選択できます（通知を送る場合、未読管理も有効になります）"
    >
      <user-notification-list
        v-if="currentChannelId"
        :channel-id="currentChannelId"
      />
    </modal-section>
  </modal-frame>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import useCurrentChannelPath from '/@/use/currentChannelPath'
import ModalFrame from '../Common/ModalFrame.vue'
import ModalSection from '../Common/ModalSection.vue'
import NotificationStateSelector from './NotificationStateSelector.vue'
import UserNotificationList from './UserNotificationList.vue'
import { useMessagesView } from '/@/store/domain/messagesView'

export default defineComponent({
  name: 'NotificationModal',
  components: {
    ModalFrame,
    ModalSection,
    NotificationStateSelector,
    UserNotificationList
  },
  setup() {
    const { currentChannelId } = useMessagesView()
    const { currentChannelPathString } = useCurrentChannelPath()
    return { currentChannelId, currentChannelPathString }
  }
})
</script>

<style lang="scss" module></style>
