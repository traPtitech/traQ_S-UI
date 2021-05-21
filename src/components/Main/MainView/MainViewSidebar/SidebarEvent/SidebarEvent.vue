<template>
  <component
    :is="comp"
    v-if="comp"
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
      }
      return undefined
    })

    return { comp }
  }
})
</script>
