<template>
  <InfomationSidebarEventFrame
    title="親チャンネル変更"
    icon-name="hash"
    :user-id="details.userId"
    :datetime="datetime"
    :link="newParentLink"
  >
    {{ newParentPath }}
  </InfomationSidebarEventFrame>
</template>

<script lang="ts" setup>
import type { ParentChangedEvent } from '@traptitech/traq'

import { computed } from 'vue'

import useChannelPath from '/@/composables/useChannelPath'

import InfomationSidebarEventFrame from './InfomationSidebarEventFrame.vue'

const props = defineProps<{
  datetime: string
  details: ParentChangedEvent
}>()

const { channelIdToPathString, channelIdToLink } = useChannelPath()

const newParentPath = computed(() =>
  channelIdToPathString(props.details.after, true)
)

const newParentLink = computed(() => channelIdToLink(props.details.after) ?? '')
</script>
