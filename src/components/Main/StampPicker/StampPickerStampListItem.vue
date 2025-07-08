<template>
  <transition name="stamp-pressed" mode="out-in">
    <button
      :key="pressedAnimationKey"
      :class="$style.container"
      @click="onClickStamp"
      @mouseenter="onStampHover"
    >
      <!-- keyにしてアニメーションが動くようにしている -->
      <a-stamp
        :stamp-id="stamp.id"
        :size="32"
        :class="$style.item"
        no-context-menu
      />
    </button>
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
.container {
  border-radius: 4px;
  &:focus-within {
    box-shadow: inset 0 0 0 2px $theme-accent-focus-default;
  }
  &:hover {
    @include background-secondary;
  }
}
.item {
  padding: 4px;
  cursor: pointer;
  user-select: none;
  content-visibility: auto;
  contain-intrinsic-size: 32px 32px;
}
</style>
