<template>
  <transition name="stamp-pressed" mode="out-in">
    <!-- keyにしてアニメーションが動くようにしている -->
    <a-stamp
      :key="pressedAnimationKey"
      :stamp-id="stamp.id"
      :size="32"
      :class="$style.item"
      no-context-menu
      @click="onClickStamp"
      @mouseenter="onStampHover"
    />
  </transition>
</template>

<script lang="ts" setup>
import AStamp from '/@/components/UI/AStamp.vue'
import type { StampId } from '/@/types/entity-ids'
import type { Stamp } from '@traptitech/traq'

const props = defineProps<{
  stamp: Readonly<Stamp>
  pressedAnimationKey: string
}>()

const emit = defineEmits<{
  (e: 'inputStamp', id: StampId): void
  (e: 'hoverStamp', id: StampId): void
}>()

const onClickStamp = () => {
  emit('inputStamp', props.stamp.id)
}
const onStampHover = () => {
  emit('hoverStamp', props.stamp.id)
}
</script>

<style lang="scss" module>
.item {
  padding: 4px;
  cursor: pointer;
  user-select: none;
  content-visibility: auto;
  contain-intrinsic-size: 32px 32px;
  &:hover {
    @include background-secondary;
  }
}
</style>
