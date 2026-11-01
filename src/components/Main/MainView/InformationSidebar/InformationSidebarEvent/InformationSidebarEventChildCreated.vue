<template>
  <InformationSidebarEventFrame
    title="子チャンネル作成"
    icon-name="hash"
    :user-id="details.userId"
    :datetime="datetime"
    :link="newChildLink"
  >
    {{ newChildPath }}
  </InformationSidebarEventFrame>
</template>

<script lang="ts" setup>
import type { ChildCreatedEvent } from '@traptitech/traq'

import { computed } from 'vue'

import useCachedChannelPath from '/@/composables/useCachedChannelPath'

import InformationSidebarEventFrame from './InformationSidebarEventFrame.vue'

const props = defineProps<{
  datetime: string
  details: ChildCreatedEvent
}>()

const { channelIdToShortPathString, channelIdToLink } = useCachedChannelPath()

const newChildPath = computed(() =>
  channelIdToShortPathString(props.details.channelId, true)
)

const newChildLink = computed(
  () => channelIdToLink(props.details.channelId) ?? ''
)
</script>
