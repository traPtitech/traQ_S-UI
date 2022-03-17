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

<script lang="ts" setup>
import { defineAsyncComponent, ref } from 'vue'
import { ChannelId } from '/@/types/entity-ids'
import { ChannelTreeNode } from '/@/lib/channelTree'
import { Channel } from '@traptitech/traq'
import { useOpenLink } from '/@/composables/useOpenLink'
import useChannelPath from '/@/composables/useChannelPath'
import SlideDown from '/@/components/UI/SlideDown.vue'

// 型エラー・コンポーネント循環参照の回避
const ChannelElement = defineAsyncComponent(
  () => import('./ChannelElement.vue')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) as any

withDefaults(
  defineProps<{
    isShown?: boolean
    channels: ReadonlyArray<ChannelTreeNode | Channel>
    ignoreChildren?: boolean
    showShortenedPath?: boolean
    showTopic?: boolean
  }>(),
  {
    isShown: true,
    ignoreChildren: false,
    showShortenedPath: false,
    showTopic: false
  }
)

const { openLink } = useOpenLink()
const { channelIdToLink } = useChannelPath()

const foldedChannels = ref(new Set<ChannelId>())
const onChannelFoldingToggle = (id: ChannelId) => {
  if (foldedChannels.value.has(id)) {
    foldedChannels.value.delete(id)
  } else {
    foldedChannels.value.add(id)
  }
}

const onChannelSelect = (event: MouseEvent, channelId: ChannelId) => {
  openLink(event, channelIdToLink(channelId))
}
</script>

<style lang="scss" module>
.element {
  margin: 4px 0;
}
</style>
