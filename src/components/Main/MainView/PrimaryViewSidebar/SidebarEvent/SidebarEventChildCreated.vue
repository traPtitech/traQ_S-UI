<template>
  <sidebar-event-frame
    title="子チャンネル作成"
    icon-name="hash"
    :user-id="details.userId"
    :datetime="datetime"
    :link="newChildLink"
  >
    {{ newChildPath }}
  </sidebar-event-frame>
</template>

<script lang="ts" setup>
import SidebarEventFrame from './SidebarEventFrame.vue'
import { computed } from 'vue'
import { ChildCreatedEvent } from '@traptitech/traq'
import useChannelPath from '/@/composables/useChannelPath'

const props = defineProps<{
  datetime: string
  details: ChildCreatedEvent
}>()

const { channelIdToShortPathString, channelIdToLink } = useChannelPath()

const newChildPath = computed(() =>
  channelIdToShortPathString(props.details.channelId, true)
)

const newChildLink = computed(() => channelIdToLink(props.details.channelId))
</script>
