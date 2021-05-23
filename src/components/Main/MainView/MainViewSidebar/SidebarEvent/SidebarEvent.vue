<template>
  <component
    :is="comp"
    v-if="comp"
    :type="event.type"
    :datetime="event.datetime"
    :details="event.detail"
  />
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import { ParsedChannelEvent } from '@/lib/apis'
import { ChannelEventTypeEnum } from '@traptitech/traq'
import SidebarEventTopicChanged from './SidebarEventTopicChanged.vue'
import SidebarEventSubscribersChanged from './SidebarEventSubscribersChanged.vue'
import SidebarEventPinnedChanged from './SidebarEventPinnedChanged.vue'
import SidebarEventNameChanged from './SidebarEventNameChanged.vue'
import SidebarEventParentChanged from './SidebarEventParentChanged.vue'

export default defineComponent({
  name: 'SidebarEvent',
  props: {
    event: {
      type: Object as PropType<ParsedChannelEvent>,
      required: true
    }
  },
  setup(props) {
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
      }
      return undefined
    })

    return { comp }
  }
})
</script>
