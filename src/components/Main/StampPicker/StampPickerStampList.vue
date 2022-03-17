<template>
  <div :class="$style.container">
    <a-stamp
      v-for="stamp in stamps"
      :key="stamp.id"
      :stamp-id="stamp.id"
      :size="32"
      :class="$style.stampListItem"
      @click="onClickStamp(stamp.id)"
      @mouseenter="onStampHover(stamp.name)"
      @mouseleave="onStampUnhover"
    />
  </div>
</template>

<script lang="ts" setup>
import AStamp from '/@/components/UI/AStamp.vue'
import { StampId } from '/@/types/entity-ids'
import { Stamp } from '@traptitech/traq'

defineProps<{
  stamps: readonly Stamp[]
}>()

const emit = defineEmits<{
  (e: 'inputStamp', id: StampId): void
  (e: 'hoverStamp', name?: string): void
}>()

const onClickStamp = (id: StampId) => {
  emit('inputStamp', id)
}
const onStampHover = (name: string) => {
  emit('hoverStamp', name)
}
const onStampUnhover = () => {
  emit('hoverStamp')
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

.stampListItem {
  padding: 4px;
  cursor: pointer;
  user-select: none;
  &:hover {
    @include background-secondary;
  }
}
</style>
