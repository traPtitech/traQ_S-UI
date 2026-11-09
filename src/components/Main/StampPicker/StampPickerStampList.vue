<template>
  <div ref="targetRef" :class="$style.frame" @scroll.passive="onScroll">
    <div
      ref="cellSizeRef"
      :class="$style.cellSizeProbe"
      :style="{ width: `${stampSize / 16}rem` }"
      aria-hidden="true"
    />
    <div :style="containerStyle">
      <div :style="panelStyle">
        <StampPickerStampListItem
          v-for="{ stamp, key } in stampsWithAnimationKey"
          :key="stamp.id"
          :stamp="stamp"
          :size="stampSize"
          :pressed-animation-key="key"
          @input-stamp="onInputStamp"
          @hover-stamp="onHoverStamp"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Stamp } from '@traptitech/traq'

import { computed, shallowRef } from 'vue'

import type { StampId } from '/@/types/entity-ids'

import StampPickerStampListItem from './StampPickerStampListItem.vue'
import useStampListVirtualScroll from './composables/useStampListVirtualScroll'

const props = defineProps<{
  stamps: readonly Stamp[]
  animationKeys: Map<StampId, number>
}>()

const emit = defineEmits<{
  (e: 'inputStamp', id: StampId): void
  (e: 'hoverStamp', id: StampId): void
}>()

const targetRef = shallowRef<HTMLElement | null>(null)
const cellSizeRef = shallowRef<HTMLElement | null>(null)
const stampSize = 32
const { onScroll, showStartIndex, showEndIndex, containerStyle, panelStyle } =
  useStampListVirtualScroll(
    targetRef,
    cellSizeRef,
    computed(() => props.stamps.length)
  )

const stampsWithAnimationKey = computed(() =>
  props.stamps.slice(showStartIndex.value, showEndIndex.value).map(stamp => ({
    stamp,
    key: `${stamp.id}-${props.animationKeys.get(stamp.id) ?? 0}`
  }))
)

const onInputStamp = (id: StampId) => {
  emit('inputStamp', id)
}
const onHoverStamp = (id: StampId) => {
  emit('hoverStamp', id)
}
</script>

<style lang="scss" module>
.frame {
  position: relative;
  height: 100%;
  overflow: hidden auto;
  scrollbar-gutter: stable;
  backface-visibility: hidden;
  contain: content;
}

.cellSizeProbe {
  position: absolute;
  visibility: hidden;
}
</style>
