<template>
  <slide-down :is-open="isShown">
    <channel-element
      v-for="channel in channels"
      :key="channel.id"
      :class="$style.element"
      :channel="channel"
      :is-opened="foldedChannels.has(channel.id)"
      :ignore-children="ignoreChildren"
      :show-shortened-path="showShortenedPath"
      :show-topic="showTopic"
      @channel-select="onChannelSelect"
      @channel-folding-toggle="onChannelFoldingToggle"
    />
  </slide-down>
</template>

<script lang="ts">
import { defineComponent, PropType, defineAsyncComponent, ref } from 'vue'
import { ChannelId } from '/@/types/entity-ids'
import { ChannelTreeNode } from '/@/lib/channelTree'
import useChannelSelect from '/@/use/channelSelect'
import { Channel } from '@traptitech/traq'
import SlideDown from '/@/components/UI/SlideDown.vue'

const useChannelFolding = () => {
  const foldedChannels = ref(new Set<ChannelId>())
  const onChannelFoldingToggle = (id: ChannelId) => {
    if (foldedChannels.value.has(id)) {
      foldedChannels.value.delete(id)
    } else {
      foldedChannels.value.add(id)
    }
  }
  return {
    foldedChannels,
    onChannelFoldingToggle
  }
}

// 型エラー・コンポーネント循環参照の回避
const ChannelElement = defineAsyncComponent(
  () => import('./ChannelElement.vue')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) as any

export default defineComponent({
  name: 'ChannelList',
  components: {
    ChannelElement,
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
    const { foldedChannels, onChannelFoldingToggle } = useChannelFolding()
    return {
      foldedChannels,
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
