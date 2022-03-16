<template>
  <modal-frame
    title="通知設定"
    :subtitle="channelPathString"
    icon-name="notified-or-subscribed"
  >
    <modal-section title="自分の通知設定">
      <notification-state-selector :channel-id="channelId" />
    </modal-section>
    <modal-section
      title="他ユーザーの通知設定"
      description="このチャンネルのメッセージの通知がユーザーに送られるか選択できます（通知を送る場合、未読管理も有効になります）"
    >
      <user-notification-list v-if="channelId" :channel-id="channelId" />
    </modal-section>
  </modal-frame>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import ModalFrame from '../Common/ModalFrame.vue'
import ModalSection from '../Common/ModalSection.vue'
import NotificationStateSelector from './NotificationStateSelector.vue'
import UserNotificationList from './UserNotificationList.vue'
import { ChannelId } from '/@/types/entity-ids'
import useChannelPath from '/@/composables/useChannelPath'

export default defineComponent({
  name: 'NotificationModal',
  components: {
    ModalFrame,
    ModalSection,
    NotificationStateSelector,
    UserNotificationList
  },
  props: {
    channelId: {
      type: String as PropType<ChannelId>,
      required: true
    }
  },
  setup(props) {
    const { channelIdToPathString } = useChannelPath()
    const channelPathString = computed(() =>
      channelIdToPathString(props.channelId, true)
    )
    return { channelPathString }
  }
})
</script>

<style lang="scss" module></style>
