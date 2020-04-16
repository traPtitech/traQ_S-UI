<template>
  <channel-side-bar-content title="トピック" @click="toggle">
    <template #header-control>
      <icon
        width="20"
        height="20"
        :style="styles.icon"
        name="rounded-triangle"
        :class="$style.icon"
      />
    </template>
    <template #content>
      <channel-side-bar-topic-content
        v-if="state.isOpen"
        :topic-content="topicContent"
        :is-open="state.isOpen"
      />
    </template>
  </channel-side-bar-content>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import Icon from '@/components/UI/Icon.vue'
import ChannelSideBarTopicContent from './ChannelSideBarTopicContent.vue'
import ChannelSideBarContent from './ChannelSideBarContent.vue'

const useStyles = (state: { isOpen: boolean }) =>
  reactive({
    icon: makeStyles(theme => ({
      transform: state.isOpen ? 'rotate(180deg)' : ''
    }))
  })

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
    const styles = useStyles(state)
    const toggle = () => {
      state.isOpen = !state.isOpen
    }
    const topicContent = computed(() => store.state.domain.messagesView.topic)
    return {
      state,
      toggle,
      topicContent,
      styles
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
