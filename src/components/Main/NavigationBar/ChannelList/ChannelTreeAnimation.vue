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
        :ref="el => setRowElement(row.key, el as HTMLElement | null)"
        :class="$style.row"
        :data-key="row.key"
        :style="{ '--row-y': `${row.start}px`, height: `${row.size}px` }"
      >
        <ChannelElement
          :data-row-key="row.key"
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
        :ref="el => setRowElement(row.key, el as HTMLElement | null)"
        :class="$style.row"
        :data-key="row.key"
        :style="{ '--row-y': `${row.start}px`, height: `${row.size}px` }"
      >
        <ChannelElement
          :data-row-key="row.key"
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
import { computed, nextTick, shallowRef, useTemplateRef, watch } from 'vue'

import { useRafFn, useResizeObserver } from '@vueuse/core'

import ChannelElement from './ChannelElement.vue'
import {
  CHANNEL_TREE_ANIMATION_DURATION_MS,
  type ChannelTreeAnimationMeasurement,
  type VisibleChannelTreeAnimation
} from './channelTreeAnimation'
import { measureChannelTreeHeight } from './channelTreeMeasurement'

const props = withDefaults(
  defineProps<{
    animation: VisibleChannelTreeAnimation
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
  (
    event: 'measure',
    animationId: number,
    measurements: ChannelTreeAnimationMeasurement[]
  ): void
}>()

const treeElement = useTemplateRef<HTMLElement>('treeElement')
const pendingMeasurements = new Map<string, number>()

useRafFn(async () => {
  if (pendingMeasurements.size > 0) {
    const measurements = [...pendingMeasurements].map(([key, size]) => ({
      key,
      size
    }))

    pendingMeasurements.clear()
    emit('measure', props.animation.id, measurements)
    await nextTick()
  }

  const element = treeElement.value
  if (element) {
    emit('resize', props.animation.id, measureChannelTreeHeight(element))
  }
})

const rowElements = shallowRef(new Map<string, HTMLElement>())
const observedElements = computed(() => [...rowElements.value.values()])

const setRowElement = (key: string, row: HTMLElement | null) => {
  const element = row?.firstElementChild as HTMLElement | null | undefined
  if (
    !props.showTopic ||
    rowElements.value.get(key) === (element ?? undefined)
  ) {
    return
  }

  const elements = new Map(rowElements.value)

  if (element) {
    elements.set(key, element)
  } else {
    elements.delete(key)
  }

  rowElements.value = elements
}

watch(
  rowElements,
  (elements, previousElements) => {
    const measurements = [...elements].flatMap(([key, element]) => {
      if (previousElements.get(key) === element) return []

      const size = measureChannelTreeHeight(element)

      return size > 0 ? [{ key, size }] : []
    })

    if (measurements.length > 0) {
      emit('measure', props.animation.id, measurements)
    }
  },
  { flush: 'post' }
)

useResizeObserver(
  observedElements,
  entries => {
    for (const entry of entries) {
      const key = (entry.target as HTMLElement).dataset['rowKey']
      if (key) {
        pendingMeasurements.set(
          key,
          measureChannelTreeHeight(entry.target, entry)
        )
      }
    }
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
  overflow: hidden;
  position: absolute;
  top: var(--row-y);
  width: 100%;
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
