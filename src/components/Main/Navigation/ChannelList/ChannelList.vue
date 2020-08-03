<template>
  <slide-down :is-open="isShown">
    <channel-element
      v-for="channel in channels"
      :key="channel.id"
      :class="$style.element"
      :channel="channel"
      :is-opened="channelFoldingState[channel.id]"
      :ignore-children="ignoreChildren"
      :show-shortened-path="showShortenedPath"
      :show-topic="showTopic"
      @channel-select="onChannelSelect"
      @channel-folding-toggle="onChannelFoldingToggle"
    />
  </slide-down>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, PropType } from 'vue'
import { ChannelId } from '@/types/entity-ids'
import { ChannelTreeNode } from '@/store/domain/channelTree/state'
import useChannelSelect from '@/use/channelSelect'
import { Channel } from '@traptitech/traq'
import SlideDown from '@/components/UI/SlideDown.vue'

const useChannelFolding = () => {
  const state = reactive({
    channelFoldingState: {} as Record<ChannelId, boolean>
  })
  const onChannelFoldingToggle = (id: ChannelId) => {
    if (state.channelFoldingState[id]) {
      state.channelFoldingState[id] = false
    } else {
      state.channelFoldingState[id] = true
    }
  }
  return {
    ...toRefs(state),
    onChannelFoldingToggle
  }
}

export default defineComponent({
  name: 'ChannelList',
  components: {
    // 型エラー・コンポーネント循環参照の回避
    ChannelElement: (() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      import('./ChannelElement.vue')) as any,
    SlideDown
  },
  props: {
    isShown: {
      type: Boolean,
      default: true
    },
    channels: {
      type: Array as PropType<Array<ChannelTreeNode | Channel>>,
      required: true
    },
    ignoreChildren: {
      type: Boolean,
      default: false
    },
    showShortenedPath: {
      type: Boolean,
      default: false
    },
    showTopic: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    const { onChannelSelect } = useChannelSelect()
    const { channelFoldingState, onChannelFoldingToggle } = useChannelFolding()
    return {
      channelFoldingState,
      onChannelSelect,
      onChannelFoldingToggle
    }
  }
})
</script>

<style lang="scss" module>
.element {
  margin: 4px 0;
}
</style>
