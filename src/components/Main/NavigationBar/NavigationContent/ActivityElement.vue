<template>
  <router-link :to="channelLink">
    <message-panel
      :message="message"
      :title-type="titleType"
      line-clamp-content
    />
  </router-link>
</template>

<script lang="ts" setup>
import MessagePanel from '/@/components/UI/MessagePanel/MessagePanel.vue'
import { computed } from 'vue'
import { ActivityTimelineMessage } from '@traptitech/traq'
import useChannelPath from '/@/composables/useChannelPath'

const props = defineProps<{
  type: 'channel' | 'message'
  message: ActivityTimelineMessage
}>()

const { channelIdToLink } = useChannelPath()

const titleType = computed(() =>
  props.type === 'channel' ? 'channel' : 'user'
)
const channelLink = computed(() => channelIdToLink(props.message.channelId))
</script>
