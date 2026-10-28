<template>
  <InformationSidebarEventTopicChanged
    v-if="event.type === ChannelEventTypeEnum.TopicChanged"
    :datetime="event.datetime"
    :details="event.detail"
  />
  <InformationSidebarEventSubscribersChanged
    v-else-if="event.type === ChannelEventTypeEnum.SubscribersChanged"
    :datetime="event.datetime"
    :details="event.detail"
  />
  <InformationSidebarEventPinnedChanged
    v-else-if="
      event.type === ChannelEventTypeEnum.PinAdded ||
      event.type === ChannelEventTypeEnum.PinRemoved
    "
    :datetime="event.datetime"
    :details="event.detail"
    :type="event.type"
  />
  <InformationSidebarEventNameChanged
    v-else-if="event.type === ChannelEventTypeEnum.NameChanged"
    :datetime="event.datetime"
    :details="event.detail"
  />
  <InformationSidebarEventParentChanged
    v-else-if="event.type === ChannelEventTypeEnum.ParentChanged"
    :datetime="event.datetime"
    :details="event.detail"
  />
  <InformationSidebarEventArchiveChanged
    v-else-if="event.type === ChannelEventTypeEnum.VisibilityChanged"
    :datetime="event.datetime"
    :details="event.detail"
  />
  <InformationSidebarEventForcedNotificationChanged
    v-else-if="event.type === ChannelEventTypeEnum.ForcedNotificationChanged"
    :datetime="event.datetime"
    :details="event.detail"
  />
  <InformationSidebarEventChildCreated
    v-else-if="event.type === ChannelEventTypeEnum.ChildCreated"
    :datetime="event.datetime"
    :details="event.detail"
  />
</template>

<script lang="ts" setup>
import { ChannelEventTypeEnum } from '@traptitech/traq'

import type { ParsedChannelEvent } from '/@/lib/apis'

import InformationSidebarEventArchiveChanged from './InformationSidebarEventArchiveChanged.vue'
import InformationSidebarEventChildCreated from './InformationSidebarEventChildCreated.vue'
import InformationSidebarEventForcedNotificationChanged from './InformationSidebarEventForcedNotificationChanged.vue'
import InformationSidebarEventNameChanged from './InformationSidebarEventNameChanged.vue'
import InformationSidebarEventParentChanged from './InformationSidebarEventParentChanged.vue'
import InformationSidebarEventPinnedChanged from './InformationSidebarEventPinnedChanged.vue'
import InformationSidebarEventSubscribersChanged from './InformationSidebarEventSubscribersChanged.vue'
import InformationSidebarEventTopicChanged from './InformationSidebarEventTopicChanged.vue'

defineProps<{
  event: ParsedChannelEvent
}>()
</script>
