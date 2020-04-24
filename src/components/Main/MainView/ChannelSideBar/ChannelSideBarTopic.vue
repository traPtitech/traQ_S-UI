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

<style lang="scss" module>
.container {
  width: 256px;
  border-radius: 4px;
  min-height: 0px;
  position: relative;
  z-index: 0;
  transition: 0.5s;
  overflow: hidden;
  flex-shrink: 0;
}

.icon {
  transform: rotate(0deg);
  transition: 0.5s;
}
</style>
