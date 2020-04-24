<template>
  <sidebar-content-container-foldable title="トピック">
    <channel-sidebar-topic-content :topic-content="topicContent" />
  </sidebar-content-container-foldable>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import store from '@/store'

import Icon from '@/components/UI/Icon.vue'
import SidebarContentContainerFoldable from '@/components/Main/MainView/MainViewSidebar/SidebarContentContainerFoldable.vue'
import ChannelSidebarTopicContent from './ChannelSidebarTopicContent.vue'

export default defineComponent({
  name: 'ChannelSidebarTopic',
  components: {
    SidebarContentContainerFoldable,
    ChannelSidebarTopicContent,
    Icon
  },
  setup() {
    const topicContent = computed(() => store.state.domain.messagesView.topic)
    return {
      topicContent
    }
  }
})
</script>
