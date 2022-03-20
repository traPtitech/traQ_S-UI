<template>
  <div :class="$style.container">
    <stamp-picker-stamp-list-item
      v-for="{ stamp, key } in stampsWithAnimationKey"
      :key="stamp.id"
      :stamp="stamp"
      :pressed-animation-key="key"
      @input-stamp="onInputStamp"
      @hover-stamp="onHoverStamp"
    />
  </div>
</template>

<script lang="ts" setup>
import StampPickerStampListItem from './StampPickerStampListItem.vue'
import { StampId } from '/@/types/entity-ids'
import { Stamp } from '@traptitech/traq'
import { computed } from 'vue'

const props = defineProps<{
  stamps: readonly Stamp[]
  animationKeys: Map<StampId, number>
}>()

const emit = defineEmits<{
  (e: 'inputStamp', id: StampId): void
  (e: 'hoverStamp', name?: string): void
}>()

const stampsWithAnimationKey = computed(() =>
  props.stamps.map(stamp => ({
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
.container {
  display: flex;
  flex-flow: row wrap;
  height: 100%;
  overflow-y: scroll;
  align-content: flex-start;
  backface-visibility: hidden;
  contain: content;
}
</style>
