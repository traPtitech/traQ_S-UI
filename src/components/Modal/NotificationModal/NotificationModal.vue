<template>
  <modal-frame
    title="通知設定"
    :subtitle="channelPathString"
    icon-name="notified-or-subscribed"
  >
    <notification-state-selector :channel-id="channelId" />
  </modal-frame>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import ModalFrame from '../Common/ModalFrame.vue'
import NotificationStateSelector from './NotificationStateSelector.vue'
import useChannelPath from '/@/composables/useChannelPath'
import type { ChannelId } from '/@/types/entity-ids'

const props = defineProps<{
  channelId: ChannelId
}>()

const { channelIdToPathString } = useChannelPath()
const channelPathString = computed(() =>
  channelIdToPathString(props.channelId, true)
)
</script>

<style lang="scss" module></style>
