<template>
  <message-panel
    :message="message"
    :title-type="titleType"
    line-clamp-content
    :to="channelLink"
  />
</template>

<script lang="ts" setup>
import type { ActivityTimelineMessage } from '@traptitech/traq'
import { computed } from 'vue'
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
