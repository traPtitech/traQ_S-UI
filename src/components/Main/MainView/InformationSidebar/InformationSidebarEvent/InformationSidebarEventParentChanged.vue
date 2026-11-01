<template>
  <InformationSidebarEventFrame
    title="親チャンネル変更"
    icon-name="hash"
    :user-id="details.userId"
    :datetime="datetime"
    :link="newParentLink"
  >
    {{ newParentPath }}
  </InformationSidebarEventFrame>
</template>

<script lang="ts" setup>
import type { ParentChangedEvent } from '@traptitech/traq'

import { computed } from 'vue'

import useCachedChannelPath from '/@/composables/useCachedChannelPath'

import InformationSidebarEventFrame from './InformationSidebarEventFrame.vue'

const props = defineProps<{
  datetime: string
  details: ParentChangedEvent
}>()

const { channelIdToPathString, channelIdToLink } = useCachedChannelPath()

const newParentPath = computed(() =>
  channelIdToPathString(props.details.after, true)
)

const newParentLink = computed(() => channelIdToLink(props.details.after) ?? '')
</script>
