<template>
  <div :class="$style.container">
    <a-stamp
      v-for="stamp in stamps"
      :key="stamp.id"
      :stamp-id="stamp.id"
      :size="32"
      :class="$style.stampListItem"
      @click="onClickStamp(stamp.id)"
      @hover="onStampHover(stamp.name)"
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
  (e: 'inputStamp', _id: StampId): void
  (e: 'hoverStamp', _name: string): void
}>()

const onClickStamp = (id: StampId) => {
  emit('inputStamp', id)
}
const onStampHover = (name: string) => {
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

.stampListItem {
  padding: 4px;
  cursor: pointer;
  user-select: none;
  &:hover {
    @include background-secondary;
  }
}
</style>
