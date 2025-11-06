<template>
  <ModalFrame
    title="通知設定"
    :subtitle="channelPathString"
    icon-name="notified-or-subscribed"
  >
    <ModalSection title="自分の通知設定">
      <NotificationStateSelector :channel-id="channelId" />
    </ModalSection>
    <ModalSection
      title="他ユーザーの通知設定"
      description="このチャンネルのメッセージの通知がユーザーに送られるか選択できます（通知を送る場合、未読管理も有効になります）"
    >
      <UserNotificationList
        v-if="channelId && modalMounted"
        :channel-id="channelId"
      />
    </ModalSection>
  </ModalFrame>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'

import useChannelPath from '/@/composables/useChannelPath'
import type { ChannelId } from '/@/types/entity-ids'

import ModalFrame from '../Common/ModalFrame.vue'
import ModalSection from '../Common/ModalSection.vue'
import NotificationStateSelector from './NotificationStateSelector.vue'
import UserNotificationList from './UserNotificationList.vue'

const props = defineProps<{
  channelId: ChannelId
}>()

const { channelIdToPathString } = useChannelPath()
const channelPathString = computed(
  () => channelIdToPathString(props.channelId, true) ?? ''
)

const modalMounted = ref(false)

onMounted(() => {
  setTimeout(() => {
    modalMounted.value = true
  }, 0)
})
</script>

<style lang="scss" module></style>
