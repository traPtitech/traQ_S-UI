<template>
  <div :class="$style.container" :style="styles.container">
    <channel-side-bar-topic-header @switch="show" :isOpen="state.isOpen" />
    <channel-side-bar-topic-content
      :topicContent="topicContent"
      :isOpen="state.isOpen"
      id="topic-content"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive, Ref } from '@vue/composition-api'
import { ChannelId } from '@/types/entity-ids'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import ChannelSideBarTopicHeader from './ChannelSideBarTopicHeader.vue'
import ChannelSideBarTopicContent from './ChannelSideBarTopicContent.vue'

type State = {
  isOpen: boolean
  contentHeight: number
}

const useStyles = (state: State) =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.ui.primary,
      height: state.isOpen
        ? state.contentHeight > 48
          ? `${state.contentHeight + 52}px`
          : '96px'
        : '48px'
    }))
  })

export default defineComponent({
  name: 'ChannelSideBarTopic',
  components: { ChannelSideBarTopicHeader, ChannelSideBarTopicContent },
  setup() {
    const state: State = reactive({
      isOpen: true,
      contentHeight: computed(() => {
        const obj = document.getElementById('topic-content')
        if (obj) {
          return obj.getBoundingClientRect().height
        }
        return 0
      })
    })
    const styles = useStyles(state)
    const show = () => {
      state.isOpen = !state.isOpen
    }
    const topicContent = computed(() => store.state.domain.messagesView.topic)
    return {
      styles,
      state,
      show,
      topicContent
    }
  }
})
</script>

<style lang="scss" module>
.container {
  width: 256px;
  margin-top: 16px;
  border-radius: 4px;
  min-height: 0px;
  position: relative;
  z-index: 0;
  transition: 0.5s;
  overflow: hidden;
  flex-shrink: 0;
}
</style>
