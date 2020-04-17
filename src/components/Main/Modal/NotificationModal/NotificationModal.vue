<template>
  <modal-frame
    title="通知設定"
    :subtitle="`#${channelPath}`"
    icon-mdi
    icon-name="bell"
  >
    <modal-section title="自分の通知設定">
      <notification-state-selector />
    </modal-section>
    <modal-section
      title="他ユーザーの通知設定"
      description="ユーザーに通知を送るか選択できます（通知を送る場合、未読管理も有効になります）"
    >
      <user-notification-list :channel-id="currentChannelId" />
    </modal-section>
  </modal-frame>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import store from '@/store'
import useChannelPath from '@/use/channelPath'
import ModalFrame from '../Common/ModalFrame.vue'
import ModalSection from '../Common/ModalSection.vue'
import NotificationStateSelector from './NotificationStateSelector.vue'
import UserNotificationList from './UserNotificationList.vue'

export default defineComponent({
  name: 'NotificationModal',
  components: {
    ModalFrame,
    ModalSection,
    NotificationStateSelector,
    UserNotificationList
  },
  setup() {
    const currentChannelId = computed(
      () => store.state.domain.messagesView.currentChannelId
    )
    const { channelIdToPath } = useChannelPath()
    const channelPath = computed(() =>
      channelIdToPath(currentChannelId.value).join('/')
    )
    return { currentChannelId, channelPath }
  }
})
</script>

<style lang="scss" module></style>
