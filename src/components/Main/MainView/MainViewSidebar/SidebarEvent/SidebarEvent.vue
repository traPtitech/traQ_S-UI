<template>
  <component
    :is="comp"
    v-if="comp"
    :type="event.type"
    :datetime="event.datetime"
    :details="event.detail"
  />
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { ParsedChannelEvent } from '/@/lib/apis'
import { ChannelEventTypeEnum } from '@traptitech/traq'
import SidebarEventTopicChanged from './SidebarEventTopicChanged.vue'
import SidebarEventSubscribersChanged from './SidebarEventSubscribersChanged.vue'
import SidebarEventPinnedChanged from './SidebarEventPinnedChanged.vue'
import SidebarEventNameChanged from './SidebarEventNameChanged.vue'
import SidebarEventParentChanged from './SidebarEventParentChanged.vue'
import SidebarEventArchiveChanged from './SidebarEventArchiveChanged.vue'
import SidebarEventForcedNotificationChanged from './SidebarEventForcedNotificationChanged.vue'
import SidebarEventChildCreated from './SidebarEventChildCreated.vue'

const props = defineProps<{
    event: ParsedChannelEvent
}>();

const comp = computed(() => {
  switch (props.event.type) {
    case ChannelEventTypeEnum.TopicChanged:
      return SidebarEventTopicChanged
    case ChannelEventTypeEnum.SubscribersChanged:
      return SidebarEventSubscribersChanged
    case ChannelEventTypeEnum.PinAdded:
    case ChannelEventTypeEnum.PinRemoved:
      return SidebarEventPinnedChanged
    case ChannelEventTypeEnum.NameChanged:
      return SidebarEventNameChanged
    case ChannelEventTypeEnum.ParentChanged:
      return SidebarEventParentChanged
    case ChannelEventTypeEnum.VisibilityChanged:
      return SidebarEventArchiveChanged
    case ChannelEventTypeEnum.ForcedNotificationChanged:
      return SidebarEventForcedNotificationChanged
    case ChannelEventTypeEnum.ChildCreated:
      return SidebarEventChildCreated
  }
  const invalid: never = props.event
  // eslint-disable-next-line no-console
  console.error('Unexpected event:', invalid)
  return undefined
})
</script>
