<script setup lang="ts">
import AStamp from '/@/components/UI/AStamp.vue'
const { soundName, stampId } = defineProps<{
  soundName: string
  stampId: string
}>()
</script>

<template>
  <div :class="$style.soundBoardContainer">
    <div>
      <AStamp :stamp-id="stampId" :size="32" />
    </div>
    <div :class="$style.soundNameContainer">
      {{ soundName }}
    </div>
  </div>
</template>

<style lang="scss" module>
.soundBoardContainer {
  padding: 0.5rem;
  border-radius: 0.5rem;
  gap: 0.5rem;
  display: flex;
  align-items: center;
  &:hover {
    @include background-tertiary;
  }
  width: 15rem;
  min-height: 3rem;
  user-select: none;
  @include color-ui-primary;
  @include size-body2;
}
.soundNameContainer {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
