<template>
  <SidebarEventFrame
    title="子チャンネル作成"
    icon-name="hash"
    :user-id="details.userId"
    :datetime="datetime"
    :link="newChildLink"
  >
    {{ newChildPath }}
  </SidebarEventFrame>
</template>

<script lang="ts" setup>
import type { ChildCreatedEvent } from '@traptitech/traq'

import { computed } from 'vue'

import useChannelPath from '/@/composables/useChannelPath'

import SidebarEventFrame from './SidebarEventFrame.vue'

const props = defineProps<{
  datetime: string
  details: ChildCreatedEvent
}>()

const { channelIdToShortPathString, channelIdToLink } = useChannelPath()

const newChildPath = computed(() =>
  channelIdToShortPathString(props.details.channelId, true)
)

const newChildLink = computed(
  () => channelIdToLink(props.details.channelId) ?? ''
)
</script>
