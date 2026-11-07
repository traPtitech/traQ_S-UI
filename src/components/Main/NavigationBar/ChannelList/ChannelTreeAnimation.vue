<template>
  <div
    inert
    :class="$style.flow"
    :style="{ paddingTop: `${animation.origin}px` }"
  >
    <div
      ref="treeElement"
      :class="$style.tree"
      :data-direction="animation.direction"
      :style="{
        '--tree-height': `${animation.height}px`,
        '--tree-animation-duration': `${CHANNEL_TREE_ANIMATION_DURATION_MS}ms`
      }"
      @animationcancel.self="emit('finish', animation.id)"
      @animationend.self="emit('finish', animation.id)"
    >
      <div
        v-for="row in animation.rows"
        :key="row.key"
        :class="$style.row"
        :data-key="row.key"
        :style="{ '--row-y': `${row.start}px` }"
      >
        <ChannelElement
          :class="$style.element"
          :channel="row.item.node"
          :depth="row.item.depth"
          :is-opened="row.isOpened"
          :show-topic="showTopic && (showChildTopic || row.item.depth === 0)"
          :show-shortened-path="showShortenedPath && row.item.depth === 0"
          :show-star="showStar"
          :show-notified="showNotified"
        />
      </div>
    </div>

    <div
      :class="$style.movingRows"
      :style="{ height: `${animation.trailingHeight}px` }"
    >
      <div
        v-for="row in animation.movingRows"
        :key="row.key"
        :class="$style.row"
        :data-key="row.key"
        :style="{ '--row-y': `${row.start}px` }"
      >
        <ChannelElement
          :class="$style.element"
          :channel="row.item.node"
          :depth="row.item.depth"
          :is-opened="row.isOpened"
          :show-topic="showTopic && (showChildTopic || row.item.depth === 0)"
          :show-shortened-path="showShortenedPath && row.item.depth === 0"
          :show-star="showStar"
          :show-notified="showNotified"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useTemplateRef } from 'vue'

import { useResizeObserver } from '@vueuse/core'

import ChannelElement from './ChannelElement.vue'
import {
  CHANNEL_TREE_ANIMATION_DURATION_MS,
  type ChannelTreeAnimationState
} from './channelTreeAnimation'

const props = withDefaults(
  defineProps<{
    animation: ChannelTreeAnimationState
    showShortenedPath?: boolean
    showTopic?: boolean
    showChildTopic?: boolean
    showStar?: boolean
    showNotified?: boolean
  }>(),
  {
    showShortenedPath: false,
    showTopic: false,
    showChildTopic: true,
    showStar: false,
    showNotified: false
  }
)

const emit = defineEmits<{
  (event: 'finish', animationId: number): void
  (event: 'resize', animationId: number, height: number): void
}>()

const treeElement = useTemplateRef<HTMLElement>('treeElement')

useResizeObserver(
  treeElement,
  entries => {
    const entry = entries[0]
    if (!entry) return
    const height = entry.borderBoxSize[0]?.blockSize ?? entry.contentRect.height
    emit('resize', props.animation.id, height)
  },
  { box: 'border-box' }
)
</script>

<style lang="scss" module>
.flow,
.tree,
.movingRows {
  position: relative;
  width: 100%;
}
.flow {
  pointer-events: none;
  overflow-anchor: none;
}
.tree {
  overflow: hidden;

  &[data-direction='expand'] {
    animation: expand-tree var(--tree-animation-duration)
      cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  }
  &[data-direction='collapse'] {
    animation: collapse-tree var(--tree-animation-duration)
      cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  }
}
.row {
  position: absolute;
  top: 0;
  width: 100%;
  transform: translateY(var(--row-y));
}
.element {
  margin: 0;
}

@keyframes expand-tree {
  from {
    height: 0;
  }
  to {
    height: var(--tree-height);
  }
}

@keyframes collapse-tree {
  from {
    height: var(--tree-height);
  }
  to {
    height: 0;
  }
}
</style>
