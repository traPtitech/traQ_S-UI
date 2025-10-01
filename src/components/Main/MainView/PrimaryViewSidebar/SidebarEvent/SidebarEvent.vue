<template>
  <SidebarEventTopicChanged
    v-if="event.type === ChannelEventTypeEnum.TopicChanged"
    :datetime="event.datetime"
    :details="event.detail"
  />
  <SidebarEventSubscribersChanged
    v-else-if="event.type === ChannelEventTypeEnum.SubscribersChanged"
    :datetime="event.datetime"
    :details="event.detail"
  />
  <SidebarEventPinnedChanged
    v-else-if="
      event.type === ChannelEventTypeEnum.PinAdded ||
      event.type === ChannelEventTypeEnum.PinRemoved
    "
    :datetime="event.datetime"
    :details="event.detail"
    :type="event.type"
  />
  <SidebarEventNameChanged
    v-else-if="event.type === ChannelEventTypeEnum.NameChanged"
    :datetime="event.datetime"
    :details="event.detail"
  />
  <SidebarEventParentChanged
    v-else-if="event.type === ChannelEventTypeEnum.ParentChanged"
    :datetime="event.datetime"
    :details="event.detail"
  />
  <SidebarEventArchiveChanged
    v-else-if="event.type === ChannelEventTypeEnum.VisibilityChanged"
    :datetime="event.datetime"
    :details="event.detail"
  />
  <SidebarEventForcedNotificationChanged
    v-else-if="event.type === ChannelEventTypeEnum.ForcedNotificationChanged"
    :datetime="event.datetime"
    :details="event.detail"
  />
  <SidebarEventChildCreated
    v-else-if="event.type === ChannelEventTypeEnum.ChildCreated"
    :datetime="event.datetime"
    :details="event.detail"
  />
</template>

<script lang="ts" setup>
import type { ParsedChannelEvent } from '/@/lib/apis'
import { ChannelEventTypeEnum } from '@traptitech/traq'
import SidebarEventTopicChanged from './SidebarEventTopicChanged.vue'
import SidebarEventSubscribersChanged from './SidebarEventSubscribersChanged.vue'
import SidebarEventPinnedChanged from './SidebarEventPinnedChanged.vue'
import SidebarEventNameChanged from './SidebarEventNameChanged.vue'
import SidebarEventParentChanged from './SidebarEventParentChanged.vue'
import SidebarEventArchiveChanged from './SidebarEventArchiveChanged.vue'
import SidebarEventForcedNotificationChanged from './SidebarEventForcedNotificationChanged.vue'
import SidebarEventChildCreated from './SidebarEventChildCreated.vue'

defineProps<{
  event: ParsedChannelEvent
}>()
</script>
