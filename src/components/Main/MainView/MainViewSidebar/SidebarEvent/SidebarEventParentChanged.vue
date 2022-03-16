<template>
  <sidebar-event-frame
    title="親チャンネル変更"
    icon-name="hash"
    :user-id="details.userId"
    :datetime="datetime"
    :link="newParentLink"
  >
    {{ newParentPath }}
  </sidebar-event-frame>
</template>

<script lang="ts" setup>
import SidebarEventFrame from './SidebarEventFrame.vue';
import { computed } from 'vue';
import { ParentChangedEvent } from '@traptitech/traq'
import useChannelPath from '/@/composables/useChannelPath'

const props = defineProps<{
    datetime: string,
    details: ParentChangedEvent
}>();

const { channelIdToPathString, channelIdToLink } = useChannelPath()

const newParentPath = computed(() =>
  channelIdToPathString(props.details.after, true)
)

const newParentLink = computed(() => channelIdToLink(props.details.after))
</script>
