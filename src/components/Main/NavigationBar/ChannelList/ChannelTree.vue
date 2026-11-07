<template>
  <div
    :class="$style.inner"
    :style="
      treeAnimation
        ? undefined
        : {
            paddingTop: `${virtualPadding.start}px`,
            paddingBottom: `${virtualPadding.end}px`
          }
    "
  >
    <div
      v-for="{ vItem, item, key } in displayedRows"
      :key="key"
      :ref="
        showTopic
          ? el => virtualizer.measureElement(el as Element | null)
          : undefined
      "
      :class="$style.row"
      :data-index="vItem.index"
      :data-key="key"
      :data-is-animating="treeAnimation ? '' : undefined"
      :style="
        treeAnimation
          ? {
              '--row-y': `${vItem.start - virtualizer.options.scrollMargin}px`
            }
          : undefined
      "
    >
      <ChannelElement
        :class="$style.element"
        :channel="item.node"
        :depth="item.depth"
        :is-opened="expandedNodeKeys.has(item.key)"
        :show-topic="showTopic && (showChildTopic || item.depth === 0)"
        :show-shortened-path="showShortenedPath && item.depth === 0"
        :show-star="showStar"
        :show-notified="showNotified"
        @click-hash="() => handleToggle(item.key)"
      />
    </div>

    <ChannelTreeAnimation
      v-if="treeAnimation"
      :key="treeAnimation.id"
      :animation="treeAnimation"
      :show-topic="showTopic"
      :show-child-topic="showChildTopic"
      :show-shortened-path="showShortenedPath"
      :show-star="showStar"
      :show-notified="showNotified"
      @finish="finishTreeAnimation"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, toRef } from 'vue'

import { useVirtualizer } from '@tanstack/vue-virtual'

import type { ChannelTreeNode } from '/@/lib/channelTree'

import ChannelElement from './ChannelElement.vue'
import ChannelTreeAnimation from './ChannelTreeAnimation.vue'
import useChannelFlatList from './composables/useChannelFlatList'
import useChannelTreeAnimation from './composables/useChannelTreeAnimation'

interface ChannelTreeProps {
  channels: ReadonlyArray<ChannelTreeNode>
  scrollElement: HTMLElement | null
  scrollMargin?: number
  showShortenedPath?: boolean
  showTopic?: boolean
  showChildTopic?: boolean
  showStar?: boolean
  showNotified?: boolean
}

const props = withDefaults(defineProps<ChannelTreeProps>(), {
  scrollMargin: 0,
  showShortenedPath: false,
  showTopic: false,
  showChildTopic: true,
  showStar: false,
  showNotified: false
})

const { flatItems, expandedNodeKeys, toggle } = useChannelFlatList(
  toRef(props, 'channels')
)

const virtualizer = useVirtualizer(
  computed(() => ({
    count: flatItems.value.length,
    getScrollElement: () => props.scrollElement,
    initialOffset: () => props.scrollElement?.scrollTop ?? 0,
    estimateSize: () => 36,
    overscan: 5,
    getItemKey: (index: number) => flatItems.value[index]?.key ?? index,
    scrollMargin: props.scrollMargin
  }))
)

const { displayedRows, treeAnimation, finishTreeAnimation, handleToggle } =
  useChannelTreeAnimation({
    virtualizer,
    flatItems,
    expandedNodeKeys,
    scrollMargin: computed(() => props.scrollMargin),
    toggle
  })

const virtualPadding = computed(() => {
  const first = displayedRows.value[0]?.vItem
  const last = displayedRows.value.at(-1)?.vItem
  if (!first || !last) {
    return { start: 0, end: virtualizer.value.getTotalSize() }
  }

  const scrollMargin = virtualizer.value.options.scrollMargin
  return {
    start: Math.max(first.start - scrollMargin, 0),
    end: Math.max(
      virtualizer.value.getTotalSize() - (last.end - scrollMargin),
      0
    )
  }
})
</script>

<style lang="scss" module>
.inner {
  position: relative;
}
.row {
  width: 100%;
  &[data-is-animating] {
    position: absolute;
    top: 0;
    transform: translateY(var(--row-y));
  }
}
.element {
  margin: 0;
}
</style>
