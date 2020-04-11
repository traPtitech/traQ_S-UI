<template>
  <channel-side-bar-content title="トピック">
    <template #header-control>
      <icon width="20" height="20" @click="toggle" name="rounded-triangle" />
    </template>
    <template #content>
      <channel-side-bar-topic-content
        v-if="state.isOpen"
        :topicContent="topicContent"
        :isOpen="state.isOpen"
      />
    </template>
  </channel-side-bar-content>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from '@vue/composition-api'
import { ChannelId } from '@/types/entity-ids'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import Icon from '@/components/UI/Icon.vue'
import ChannelSideBarTopicContent from './ChannelSideBarTopicContent.vue'
import ChannelSideBarContent from './ChannelSideBarContent.vue'

export default defineComponent({
  name: 'ChannelSideBarTopic',
  components: {
    ChannelSideBarTopicContent,
    ChannelSideBarContent,
    Icon
  },
  setup() {
    const state = reactive({
      isOpen: true
    })
    const toggle = () => {
      state.isOpen = !state.isOpen
    }
    const topicContent = computed(() => store.state.domain.messagesView.topic)
    return {
      state,
      toggle,
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
  cursor: pointer;
}
</style>
