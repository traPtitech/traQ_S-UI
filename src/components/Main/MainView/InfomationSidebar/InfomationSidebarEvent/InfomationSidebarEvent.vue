<template>
  <InfomationSidebarEventTopicChanged
    v-if="event.type === ChannelEventTypeEnum.TopicChanged"
    :datetime="event.datetime"
    :details="event.detail"
  />
  <InfomationSidebarEventSubscribersChanged
    v-else-if="event.type === ChannelEventTypeEnum.SubscribersChanged"
    :datetime="event.datetime"
    :details="event.detail"
  />
  <InfomationSidebarEventPinnedChanged
    v-else-if="
      event.type === ChannelEventTypeEnum.PinAdded ||
      event.type === ChannelEventTypeEnum.PinRemoved
    "
    :datetime="event.datetime"
    :details="event.detail"
    :type="event.type"
  />
  <InfomationSidebarEventNameChanged
    v-else-if="event.type === ChannelEventTypeEnum.NameChanged"
    :datetime="event.datetime"
    :details="event.detail"
  />
  <InfomationSidebarEventParentChanged
    v-else-if="event.type === ChannelEventTypeEnum.ParentChanged"
    :datetime="event.datetime"
    :details="event.detail"
  />
  <InfomationSidebarEventArchiveChanged
    v-else-if="event.type === ChannelEventTypeEnum.VisibilityChanged"
    :datetime="event.datetime"
    :details="event.detail"
  />
  <InfomationSidebarEventForcedNotificationChanged
    v-else-if="event.type === ChannelEventTypeEnum.ForcedNotificationChanged"
    :datetime="event.datetime"
    :details="event.detail"
  />
  <InfomationSidebarEventChildCreated
    v-else-if="event.type === ChannelEventTypeEnum.ChildCreated"
    :datetime="event.datetime"
    :details="event.detail"
  />
</template>

<script lang="ts" setup>
import { ChannelEventTypeEnum } from '@traptitech/traq'

import type { ParsedChannelEvent } from '/@/lib/apis'

import InfomationSidebarEventArchiveChanged from './InfomationSidebarEventArchiveChanged.vue'
import InfomationSidebarEventChildCreated from './InfomationSidebarEventChildCreated.vue'
import InfomationSidebarEventForcedNotificationChanged from './InfomationSidebarEventForcedNotificationChanged.vue'
import InfomationSidebarEventNameChanged from './InfomationSidebarEventNameChanged.vue'
import InfomationSidebarEventParentChanged from './InfomationSidebarEventParentChanged.vue'
import InfomationSidebarEventPinnedChanged from './InfomationSidebarEventPinnedChanged.vue'
import InfomationSidebarEventSubscribersChanged from './InfomationSidebarEventSubscribersChanged.vue'
import InfomationSidebarEventTopicChanged from './InfomationSidebarEventTopicChanged.vue'

defineProps<{
  event: ParsedChannelEvent
}>()
</script>
