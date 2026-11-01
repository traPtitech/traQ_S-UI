<template>
  <MessagePanel
    :message="message"
    :title-type="titleType"
    line-clamp-content
    :to="channelLink"
  />
</template>

<script lang="ts" setup>
import type { ActivityTimelineMessage } from '@traptitech/traq'

import { computed } from 'vue'

import MessagePanel from '/@/components/UI/MessagePanel/MessagePanel.vue'
import useChannelPath from '/@/composables/useChannelPath'
import useEnsureThread from '/@/composables/useEnsureThread'
import { constructMessagesPath } from '/@/router'

const props = defineProps<{
  type: 'channel' | 'message'
  message: ActivityTimelineMessage
}>()

useEnsureThread(() => props.message.channelId)

const { channelIdToLink } = useChannelPath()

const titleType = computed(() =>
  props.type === 'channel' ? 'channel' : 'user'
)
const channelLink = computed(() =>
  props.type === 'channel'
    ? (channelIdToLink(props.message.channelId) ?? '')
    : constructMessagesPath(props.message.id)
)
</script>
