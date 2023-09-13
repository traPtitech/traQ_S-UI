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
      <user-notification-list
        v-if="channelId && modalMounted"
        :channel-id="channelId"
      />
    </modal-section>
  </modal-frame>
</template>

<script lang="ts" setup>
import ModalFrame from '../Common/ModalFrame.vue'
import ModalSection from '../Common/ModalSection.vue'
import NotificationStateSelector from './NotificationStateSelector.vue'
import UserNotificationList from './UserNotificationList.vue'
import { computed, onMounted, ref } from 'vue'
import type { ChannelId } from '/@/types/entity-ids'
import useChannelPath from '/@/composables/useChannelPath'

const props = defineProps<{
  channelId: ChannelId
}>()

const { channelIdToPathString } = useChannelPath()
const channelPathString = computed(() =>
  channelIdToPathString(props.channelId, true)
)

const modalMounted = ref(false)

onMounted(() => {
  setTimeout(() => {
    modalMounted.value = true
  }, 0)
})
</script>

<style lang="scss" module></style>
