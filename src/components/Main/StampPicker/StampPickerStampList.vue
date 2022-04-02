<template>
  <div ref="targetRef" :class="$style.frame" @scroll.passive="onScroll">
    <div :style="containerStyle">
      <div :class="$style.panel" :style="panelStyle">
        <stamp-picker-stamp-list-item
          v-for="{ stamp, key } in stampsWithAnimationKey"
          :key="stamp.id"
          :stamp="stamp"
          :pressed-animation-key="key"
          @input-stamp="onInputStamp"
          @hover-stamp="onHoverStamp"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import StampPickerStampListItem from './StampPickerStampListItem.vue'
import type { StampId } from '/@/types/entity-ids'
import type { Stamp } from '@traptitech/traq'
import { computed, shallowRef } from 'vue'
import useStampListVirtualScroll from './composables/useStampListVirtualScroll'

const props = defineProps<{
  stamps: readonly Stamp[]
  animationKeys: Map<StampId, number>
}>()

const emit = defineEmits<{
  (e: 'inputStamp', id: StampId): void
  (e: 'hoverStamp', name?: string): void
}>()

const targetRef = shallowRef<HTMLElement | null>(null)
const { onScroll, showStartIndex, showEndIndex, containerStyle, panelStyle } =
  useStampListVirtualScroll(
    targetRef,
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
const onHoverStamp = (name?: string) => {
  emit('hoverStamp', name)
}
</script>

<style lang="scss" module>
.frame {
  height: 100%;
  overflow-y: scroll;
  backface-visibility: hidden;
  contain: content;
}

.panel {
  display: flex;
  flex-flow: row wrap;
  align-content: flex-start;
}
</style>
